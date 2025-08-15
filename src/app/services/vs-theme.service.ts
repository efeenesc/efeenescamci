import { Injectable } from '@angular/core';
import * as vst from '@apptypes/vs-types';
import stripJsonComments from 'strip-json-comments';
import type JSZip from 'jszip';
import { ScopeFinder } from '@classes/scopefinder';
import { ColorScheme, ThemeColors, ThemeType } from '@classes/colorscheme';
import { LocalStorageService } from './local-storage.service';
import { ThemeMetadata, ThemePackage } from '@apptypes/vs/manifest';
import { BehaviorSubject } from 'rxjs';

export type iconDownloadConfig = 'none' | 'small' | 'large';

export interface ThemeInfo {
	themeId: string;
	themeName: string;
	themeAuthor: string;
	themeIcon: string;
}

@Injectable({
	providedIn: 'root',
})
export class VsThemeService {
	private dJSZip?: JSZip; // Dynamically imported JSZip
	private dPlistParse?: (input: string | ArrayBuffer) => unknown; // Dynamically imported 'parse' method of the '@plist/parse' library
	activeThemeVariantName = new BehaviorSubject<string>('');

	constructor(private _lss: LocalStorageService) {
		const currentVariant = this._lss.get('theme_variant');

		if (currentVariant) this.activeThemeVariantName.next(currentVariant);

		this._lss.valueChanges.subscribe((nv) => {
			if (nv.key === 'theme_variant')
				this.activeThemeVariantName.next(nv.value);
		});
	}

	/**
	 * Fetches and filters Visual Studio themes based on the provided filter criteria.
	 * Optionally downloads theme icons based on the provided icon size configuration.
	 *
	 * @param requestedFilter - The filter criteria for searching themes.
	 * @param downloadIcons - Configuration for icon download size ('small' or 'large').
	 * @returns A promise resolving to the filtered results or null.
	 */
	getFilteredResults = async (
		requestedFilter: vst.VSFilterBody,
		downloadIcons: iconDownloadConfig = 'none',
	): Promise<vst.VSResultBody | null> => {
		const postBody = JSON.stringify(requestedFilter);

		const postResult = await fetch(
			'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					accept: 'application/json;api-version=3.0-preview.1',
				},
				body: postBody,
			},
		);

		const finalObj = (await postResult.json()) as vst.VSResultBody;

		if (downloadIcons !== 'none') {
			for (const result of finalObj.results) {
				for (const ext of result.extensions) {
					ext.extensionIcon = await this.getIcon(ext, downloadIcons);
				}
			}
		}

		finalObj.results[0].extensions = finalObj.results[0].extensions.filter(
			(ext) =>
				!ext.displayName.toLowerCase().includes('icon') && // Exclude any theme that includes the word icon in its name
				ext.displayName !== 'PowerShell', // Exclude PowerShell
		);

		return finalObj;
	};

	/**
	 * Downloads a package file as a ZIP archive from the specified URL.
	 * Supports tracking progress via a callback function and cancellation.
	 *
	 * @param requestedPackage - The URL of the package to be downloaded.
	 * @param progressCallback - Optional callback function to track download progress.
	 * @param signal - An optional AbortSignal to cancel the request.
	 * @returns A promise resolving to the loaded JSZip object.
	 */
	getPackageFile = async (
		requestedPackage: string,
		progressCallback?: (loaded: number, total: number) => void,
		signal?: AbortSignal,
	): Promise<JSZip> => {
		if (typeof this.dJSZip === 'undefined') {
			this.dJSZip = (await import('jszip')).default;
		}

		return new Promise((resolve, reject) => {
			const client = new XMLHttpRequest();
			client.open('GET', requestedPackage, true);
			client.responseType = 'arraybuffer';

			// Abort logic
			if (signal) {
				signal.addEventListener('abort', () => {
					client.abort();
					reject(new Error('Download aborted'));
				});
			}

			client.onprogress = (prog) => {
				if (prog.lengthComputable && progressCallback) {
					progressCallback(prog.loaded, prog.total);
				}
			};

			client.onload = async () => {
				if (client.status === 200) {
					try {
						const zip = await this.dJSZip!.loadAsync(client.response);
						resolve(zip);
					} catch (error) {
						reject(error);
					}
				} else {
					reject(new Error(`HTTP error! status: ${client.status}`));
				}
			};

			client.onerror = () => {
				reject(new Error('Network error occurred'));
			};

			client.send();
		});
	};

	/**
	 * Changes the current theme by extracting theme details from the provided VS Code extension package.
	 * Applies the theme and updates the application accordingly.
	 *
	 * @param ext - The Visual Studio extension containing the theme.
	 * @param progress - Optional callback function to track theme application progress.
	 * @param signal - Optional AbortSignal to cancel the theme application.
	 */
	async changeTheme(
		ext: vst.VSExtension,
		progress?: (loaded: number, total: number) => void,
	) {
		const fileArray = ext.versions[0].files;
		const pkglink: string = fileArray.find(
			(thing) =>
				thing['assetType'] === 'Microsoft.VisualStudio.Services.VSIXPackage',
		)!['source'];

		const zip = await this.getPackageFile(pkglink, progress);

		const packagemanifest =
			await zip.files['extension/package.json'].async('string');
		const pkg_json = JSON.parse(packagemanifest) as ThemePackage;
		let pkg_logo_path = pkg_json.icon;
		const pkg_themes = pkg_json.contributes.themes;

		if (pkg_logo_path.charAt(0) === '/') {
			pkg_logo_path = pkg_logo_path.substring(1);
		}

		const themeName = pkg_json.displayName;
		const themeAuthor = pkg_json.publisher;
		const themeId = ext.extensionId;

		const themeIcon =
			await zip.files[`extension/${pkg_logo_path}`].async('base64');

		const themeInfo: ThemeInfo = {
			themeId,
			themeName,
			themeAuthor,
			themeIcon,
		};

		const themes = await this.readThemes(pkg_themes, zip);
		this.changeColorVariables(themes[0]);
		this.setThemeInternal(themeInfo, themes[0].name, themes);
	}

	/**
	 * Saves the theme information and theme color schemes to local storage.
	 *
	 * @param info - The theme information object.
	 * @param themes - Optional array of color schemes associated with the theme.
	 */
	public setThemeInternal(
		info: ThemeInfo,
		newVariantName: string,
		themes?: ColorScheme[],
	) {
		this._lss.set('theme_name', info.themeName);
		this._lss.set('theme_author', info.themeAuthor);
		this._lss.set('theme_id', info.themeId);
		this._lss.set('theme_icon', info.themeIcon);
		this._lss.set('theme_variant', newVariantName);

		if (themes) {
			this._lss.set('themes', JSON.stringify(themes));
		}
	}

	/**
	 * Applies the given variant of the current theme.
	 */
	public setThemeVariant(newVariant: ColorScheme) {
		this.changeColorVariables(newVariant);
	}

	/**
	 * Reads and parses themes from the provided list and ZIP archive.
	 * Supports both JSON and XML (Plist) theme formats.
	 *
	 * @param themesList - List of theme metadata to be read.
	 * @param zip - The ZIP archive containing theme files.
	 * @returns A promise resolving to an array of parsed color schemes.
	 */
	private async readThemes(
		themesList: ThemeMetadata[],
		zip: JSZip,
	): Promise<ColorScheme[]> {
		const themePalettes: ColorScheme[] = await Promise.all(
			themesList.map(async (theme) => {
				const colorTheme = theme.uiTheme === 'vs-dark' ? 'dark' : 'light';

				const themeFile =
					await zip.files[
						`extension${theme.path.substring(1, theme.path.length)}` // Discard the . at the start of a path, e.g.: ./themes/1.json
					].async('string');

				const colorScheme = themeFile.substring(0, 5).includes('<?xml')
					? await this.readPlistFile(themeFile, colorTheme as ThemeType)!
					: this.readJSONFile(themeFile, colorTheme as ThemeType)!;

				colorScheme.name = theme.label;
				return colorScheme;
			}),
		);

		return themePalettes;
	}

	/**
	 * Changes the current theme using a JSON string by parsing it into a ColorScheme object.
	 * Applies the parsed color scheme to the application.
	 *
	 * @param themeJson - The JSON string representing the theme's color scheme.
	 */
	async changeThemeJson(themeJson: string) {
		if (!themeJson || themeJson.length <= 0) return;

		try {
			const themeObj = JSON.parse(themeJson) as ColorScheme;
			this.changeColorVariables(themeObj);
		} catch (ex) {
			console.error(`Error while applying theme: ${ex}`);
		}
	}

	/**
	 * Converts a Blob object to a Base64-encoded string asynchronously.
	 *
	 * @param blob - The Blob object to be converted.
	 * @returns A promise resolving to a Base64 string, null, or an ArrayBuffer.
	 */
	blobToBase64(blob: Blob): Promise<string | null | ArrayBuffer> {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.readAsDataURL(blob);
		});
	}

	/**
	 * Fetches an extension's icon based on the preferred icon size and converts it to a Base64 string.
	 *
	 * @param ext - The Visual Studio extension containing the icon.
	 * @param iconSizePreference - Preferred icon size ('small' or 'large'). Defaults to small
	 * @returns A promise resolving to a Base64 string, or null if the icon is not found.
	 */
	async getIcon(
		ext: vst.VSExtension,
		iconSizePreference: 'small' | 'large' = 'small',
	): Promise<string | null> {
		let extUri;

		if (iconSizePreference === 'small') {
			extUri = ext.versions[0].files?.find(
				(prop) =>
					prop.assetType === 'Microsoft.VisualStudio.Services.Icons.Small',
			)?.source;
		}

		if (iconSizePreference === 'large' || !extUri) {
			extUri = ext.versions[0].files?.find(
				(prop) =>
					prop.assetType === 'Microsoft.VisualStudio.Services.Icons.Default',
			)?.source;
		}

		if (!extUri) return null;

		const res = await fetch(extUri);
		const blob = await res.blob();
		const base64 = await this.blobToBase64(blob);

		if (typeof base64 === 'string') return base64;
		return null;
	}

	/**
	 * Gets locally stored theme variants of the currently applied theme.
	 * These variants are saved to local storage under the 'themes' key.
	 * Themes' variants are saved right after a theme is downloaded and applied.
	 */
	getLocalThemeVariants(): ColorScheme[] | undefined {
		const local = this._lss.get('themes');
		if (!local) return;

		const themes: ColorScheme[] = JSON.parse(local);
		return themes;
	}

	/**
	 * Reads and parses a Plist file, extracting color scheme details from it.
	 *
	 * @param filestr - The content of the Plist file as a string.
	 * @param themeType - The type of color theme ('dark' or 'light').
	 * @returns A ColorScheme object with extracted color details.
	 */
	private async readPlistFile(
		filestr: string,
		themeType: ThemeType,
	): Promise<ColorScheme> {
		if (typeof this.dPlistParse === 'undefined') {
			this.dPlistParse = ((await import('@plist/parse')) as any).parse;
		}

		const pfile = this.dPlistParse!(filestr);

		const sf = new ScopeFinder('plist', pfile);
		const tc: ThemeColors = {};

		tc.theme900 = sf.GetForeground('background');
		tc.theme600 = sf.GetForeground('editor.background');
		tc.theme300 = sf.GetForeground('input.background');
		tc.text =
			sf.GetForeground('foreground') ||
			sf.GetForeground('constant.other') ||
			sf.GetForeground('variable.other.constant') ||
			sf.GetForeground('constant.other.color') ||
			sf.GetForeground('constant');
		tc.accent1 =
			sf.GetForeground('constant.language') ?? sf.GetForeground('string');
		tc.accent2 = sf.GetForeground('constant.numeric');
		tc.highlight = sf.GetForeground('lineHighlight');
		tc.border1 = sf.GetForeground('editor.border');

		const cs = new ColorScheme(themeType);
		cs.assignColorsSafe(tc);

		return cs;
	}

	/**
	 * Reads and parses a JSON file, extracting color scheme details from it.
	 *
	 * @param filestr - The content of the JSON file as a string.
	 * @param colorTheme - The type of color theme ('dark' or 'light').
	 * @returns A ColorScheme object with extracted color details.
	 */
	private readJSONFile(filestr: string, colorTheme: ThemeType): ColorScheme {
		const theme_json = JSON.parse(
			stripJsonComments(filestr, { trailingCommas: true }),
		);

		const themec = theme_json['colors'];
		const tokenc = theme_json['tokenColors'];

		const sf = new ScopeFinder('json', tokenc);
		const tc: ThemeColors = {};

		tc.theme900 = themec['sideBar.background'];
		tc.theme600 = themec['editor.background'];
		tc.theme300 = themec['input.background'];
		tc.text =
			sf.GetForeground('constant.other') ||
			sf.GetForeground('variable.other.constant') ||
			sf.GetForeground('constant.other.color') ||
			sf.GetForeground('constant');
		tc.accent1 = sf.GetForeground('string');
		tc.accent2 = sf.GetForeground('variable.parameter');
		tc.highlight = themec['editor.lineHighlightBackground'];
		tc.border1 = sf.GetForeground('editor.border');

		const cs = new ColorScheme(colorTheme);
		cs.assignColorsSafe(tc);

		return cs;
	}

	/**
	 * Applies the provided ColorScheme to the application by setting relevant CSS variables.
	 *
	 * @param cs - The ColorScheme object containing theme color details.
	 */
	changeColorVariables(cs: ColorScheme) {
		const root = document.documentElement;

		root.style.setProperty('--theme-900', cs.theme900);
		root.style.setProperty('--theme-600', cs.theme600);
		root.style.setProperty('--theme-300', cs.theme300);
		root.style.setProperty('--foreground', cs.text);
		root.style.setProperty(
			'--accent1',
			cs.accent1 === cs.text ? cs.accent2 || cs.accent1 : cs.accent1,
		);
		root.style.setProperty('--accent2', cs.accent2);
		root.style.setProperty('--border1', cs.border1);

		root.style.setProperty('--contrast', cs.contrast);
		root.style.setProperty('--inverse', cs.inverse);

		root.style.setProperty('--highlight', cs.highlight);
		root.style.setProperty('--highlight-solid', cs.highlight_solid);
		root.style.setProperty(
			'--system',
			`color-mix(in srgb, ${cs.theme900} 50%, ${cs.system} 50%)`,
		);
		document.documentElement.setAttribute('data-theme', cs.theme);

		this.activeThemeVariantName.next(cs.name);
		this.saveToLocalStorage(cs);
	}

	/**
	 * Sets the default color scheme for the application, applying a predefined light theme.
	 */
	setDefaultColorScheme(
		theme: 'light' | 'dark' | 'default',
		extIcon?: string,
	): void {
		if (theme === 'default') {
			theme =
				(window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches ?? false)
					? 'dark'
					: 'light';
		}

		const colorSchemes: ColorScheme[] = [
			Object.assign(new ColorScheme('light'), {
				name: 'Beige Light',
				theme900: '#ded8c4',
				theme600: '#e5dfca',
				theme300: '#eee8d2',
				text: '#3d3929',
				accent1: '#ad8b63',
				accent2: '#4b4848',
				border1: '#747474',
				contrast: '#000000',
				highlight: '#f3c0927c',
				highlight_solid: '#f3c092',
				theme: 'light',
				inverse: '#ffffff',
				system: '#1c1c1e',
			}),
			Object.assign(new ColorScheme('dark'), {
				name: 'Beige Dark',
				theme900: '#2d2c29',
				theme600: '#403F3A',
				theme300: '#53514b',
				text: '#e5e5e2',
				accent1: '#d97757',
				accent2: '#594a9b',
				border1: '#414141',
				contrast: '#ffffff',
				highlight: '#735a457c',
				highlight_solid: '#735a45',
				theme: 'dark',
				inverse: '#000000',
				system: '#0d0d0d',
			}),
			Object.assign(new ColorScheme('dark'), {
				name: 'Beige Inverted',
				theme900: '#20263a',
				theme600: '#373a56',
				theme300: '#373a56',
				text: '#c1c5d5',
				accent1: '#52739a',
				accent2: '#b3b6b6',
				border1: '#8a8a8a',
				contrast: '#ffffff',
				highlight: '#0d3e6c7c',
				highlight_solid: '#0d3e6c',
				theme: 'dark',
				inverse: '#000000',
				system: '#0d0d0d',
			}),
		];

		const newTheme = colorSchemes.find((cs) => cs.theme === theme)!;

		this.changeColorVariables(newTheme);
		this.setThemeInternal(
			{
				themeId: '',
				themeAuthor: 'efeenesc',
				themeIcon: extIcon!,
				themeName: 'Beige',
			},
			newTheme.name,
			colorSchemes,
		);
	}

	/**
	 * Saves the provided color scheme to local storage as a JSON string.
	 *
	 * @param cs - The ColorScheme object to be saved.
	 */
	private saveToLocalStorage(cs: ColorScheme): void {
		const jsonVal = JSON.stringify(cs);
		this.activeThemeVariantName.next(cs.name);
		this._lss.set('theme_val', jsonVal);
	}

	/**
	 * Retrieves a saved color scheme from local storage, if available.
	 *
	 * @returns A ColorScheme object representing the saved theme, or undefined if not found.
	 */
	getFromLocalStorage(): ColorScheme | undefined {
		const jsonVal = this._lss.get('theme_val');
		if (!jsonVal) return;

		const parsed = JSON.parse(jsonVal);
		return parsed as ColorScheme;
	}
}
