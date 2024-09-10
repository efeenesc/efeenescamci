import { Injectable } from '@angular/core';
import * as vst from '../types/vs-types';
import { plainToInstance } from 'class-transformer';
import plist from 'plist';
import stripJsonComments from 'strip-json-comments';
import { ScopeFinder } from '../classes/scopefinder';
import JSZip from 'jszip';
import { ColorScheme, ColorTheme } from '../classes/colorscheme';
import { LocalStorageService } from './local-storage.service';
import { ThemeMetadata, ThemePackage } from '../types/vs/manifest';

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
  constructor(private _lss: LocalStorageService) {}

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
    downloadIcons: iconDownloadConfig = 'small'
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
      }
    );

    const jsonObj = (await postResult.json()) as object;
    const finalObj = plainToInstance(vst.VSResultBody, jsonObj);

    if (downloadIcons !== 'none') {
      finalObj.results.map((result) => {
        result.extensions.map(
          async (ext) =>
            (ext.extensionIcon = await this.getIcon(ext, downloadIcons))
        );
      });
    }

    finalObj.results[0].extensions = finalObj.results[0].extensions.filter(
      (ext) =>
        !ext.displayName.toLowerCase().includes('icon') && // Exclude any theme that includes the word icon in its name
        ext.displayName !== 'PowerShell' // Exclude PowerShell
    );

    return finalObj;
  };

  /**
   * Downloads a package file as a ZIP archive from the specified URL.
   * Supports tracking progress via a callback function.
   * 
   * @param requestedPackage - The URL of the package to be downloaded.
   * @param progressCallback - Optional callback function to track download progress.
   * @returns A promise resolving to the loaded JSZip object.
   */
  getPackageFile = (
    requestedPackage: string,
    progressCallback?: (loaded: number, total: number) => void
  ): Promise<JSZip> => {
    return new Promise((resolve, reject) => {
      const client = new XMLHttpRequest();
      client.open('GET', requestedPackage, true);
      client.responseType = 'arraybuffer';

      client.onprogress = (prog) => {
        if (prog.lengthComputable && progressCallback) {
          progressCallback(prog.loaded, prog.total);
        }
      };

      client.onload = async () => {
        if (client.status === 200) {
          try {
            const zip = await JSZip.loadAsync(client.response);
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
   */
  async changeTheme(
    ext: vst.VSExtension,
    progress?: (loaded: number, total: number) => void
  ) {
    const fileArray = ext.versions[0].files;
    const pkglink: string = fileArray.find(
      (thing) =>
        thing['assetType'] === 'Microsoft.VisualStudio.Services.VSIXPackage'
    )!['source'];

    const zip = await this.getPackageFile(pkglink, progress);

    const packagemanifest = await zip.files['extension/package.json'].async(
      'string'
    );
    const pkg_json = JSON.parse(packagemanifest) as ThemePackage;
    const pkg_logo_path: string = pkg_json.icon;
    const pkg_themes = pkg_json.contributes.themes;

    const themeName = pkg_json.displayName;
    const themeAuthor = pkg_json.publisher;
    const themeId = ext.extensionId;

    const themeIcon = await zip.files[`extension/${pkg_logo_path}`].async(
      'base64'
    );

    const themeInfo: ThemeInfo = {
      themeId,
      themeName,
      themeAuthor,
      themeIcon,
    };

    const themes = await this.readThemes(pkg_themes, zip);
    this.changeColorVariables(themes[0]);

    this.setThemeInternal(themeInfo, themes);
  }

  /**
   * Saves the theme information and theme color schemes to local storage.
   * 
   * @param info - The theme information object.
   * @param themes - Optional array of color schemes associated with the theme.
   */
  private setThemeInternal(info: ThemeInfo, themes?: ColorScheme[]) {
    this._lss.set('theme_name', info.themeName);
    this._lss.set('theme_author', info.themeAuthor);
    this._lss.set('theme_id', info.themeId);
    this._lss.set('theme_icon', info.themeIcon);

    if (themes) {
      this._lss.set('themes', JSON.stringify(themes));
    }
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
    zip: JSZip
  ): Promise<ColorScheme[]> {
    const themePalettes: ColorScheme[] = await Promise.all(
      themesList.map(async (theme) => {
        const colorTheme = theme.uiTheme === 'vs-dark' ? 'dark' : 'light';

        const themeFile = await zip.files[
          `extension${theme.path.substring(1, theme.path.length)}` // Discard the . at the start of a path, e.g.: ./themes/1.json
        ].async('string');

        const colorScheme = themeFile.substring(0, 5).includes('<?xml')
          ? this.readPlistFile(themeFile, colorTheme as ColorTheme)!
          : this.readJSONFile(themeFile, colorTheme as ColorTheme)!;

        colorScheme.name = theme.label;
        return colorScheme;
      })
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
   * @param iconSizePreference - Preferred icon size ('small' or 'large').
   * @returns A promise resolving to a Base64 string, undefined, or false if the icon is not found.
   */
  async getIcon(
    ext: vst.VSExtension,
    iconSizePreference: 'small' | 'large' = 'small'
  ): Promise<string | undefined | boolean> {
    let extUri;

    if (iconSizePreference === 'small') {
      extUri = ext.versions[0].files?.find(
        (prop) =>
          prop.assetType === 'Microsoft.VisualStudio.Services.Icons.Small'
      )?.source;
    }

    if (iconSizePreference === 'large' || !extUri) {
      extUri = ext.versions[0].files?.find(
        (prop) =>
          prop.assetType === 'Microsoft.VisualStudio.Services.Icons.Default'
      )?.source;
    }

    if (!extUri) return false;

    const res = await fetch(extUri);
    const blob = await res.blob();
    const base64 = await this.blobToBase64(blob);

    if (typeof base64 === 'string') return base64;

    return false;
  }

  /**
   * Reads and parses a Plist file, extracting color scheme details from it.
   * 
   * @param filestr - The content of the Plist file as a string.
   * @param colorTheme - The type of color theme ('dark' or 'light').
   * @returns A ColorScheme object with extracted color details.
   */
  private readPlistFile(filestr: string, colorTheme: ColorTheme): ColorScheme {
    const pfile = plist.parse(filestr);

    const sf = new ScopeFinder('plist', pfile);
    const cs = new ColorScheme(colorTheme);

    cs.theme900 = sf.GetForeground('background')!;
    cs.theme600 = sf.GetForeground('editor.background')!;
    cs.theme300 = sf.GetForeground('input.background') || cs.theme600;
    cs.text =
      sf.GetForeground('foreground')! ||
      sf.GetForeground('constant.other')! ||
      sf.GetForeground('variable.other.constant')! ||
      sf.GetForeground('constant.other.color')! ||
      sf.GetForeground('constant')!;
    cs.accent1 = sf.GetForeground('constant.language')!;
    cs.accent2 = sf.GetForeground('variable.parameter')!;
    cs.highlight = sf.GetForeground('lineHighlight')!;

    const b1 = sf.GetForeground('editor.border');
    if (b1) cs.border1 = b1;

    return cs;
  }

  /**
   * Reads and parses a JSON file, extracting color scheme details from it.
   * 
   * @param filestr - The content of the JSON file as a string.
   * @param colorTheme - The type of color theme ('dark' or 'light').
   * @returns A ColorScheme object with extracted color details.
   */
  private readJSONFile(filestr: string, colorTheme: ColorTheme): ColorScheme {
    const theme_json = JSON.parse(
      stripJsonComments(filestr, { trailingCommas: true })
    );

    const themec = theme_json['colors'];
    const tokenc = theme_json['tokenColors'];

    const sf = new ScopeFinder('json', tokenc);
    const cs = new ColorScheme(colorTheme);

    cs.theme900 = themec['sideBar.background'];
    cs.theme600 = themec['editor.background'];
    cs.theme300 = themec['input.background'] || cs.theme300;
    cs.text =
      sf.GetForeground('constant.other')! ||
      sf.GetForeground('variable.other.constant')! ||
      sf.GetForeground('constant.other.color')! ||
      sf.GetForeground('constant')!;
    cs.accent1 = sf.GetForeground('string')!;
    cs.accent2 = sf.GetForeground('variable.parameter')!;
    cs.highlight = themec['editor.lineHighlightBackground']!;

    const b1 = sf.GetForeground('editor.border');
    if (b1) cs.border1 = b1;

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
      cs.accent1 === cs.text ? cs.accent2 || cs.accent1 : cs.accent1
    );
    root.style.setProperty('--accent2', cs.accent2);
    root.style.setProperty('--border1', cs.border1);

    root.style.setProperty('--contrast', cs.contrast);
    root.style.setProperty('--inverse', cs.inverse);

    root.style.setProperty('--highlight', cs.highlight);
    root.style.setProperty(
      '--system',
      `color-mix(in srgb, ${cs.theme900} 50%, ${cs.system} 50%)`
    );
    document.documentElement.setAttribute('data-theme', cs.theme);

    this.saveToLocalStorage(cs);
  }

  /**
   * Sets the default color scheme for the application, applying a predefined light theme.
   */
  setDefaultColorScheme(): void {
    const cs = new ColorScheme('light');

    cs.theme900 = '#ded8c4';
    cs.theme600 = '#c7c4a8';
    cs.theme300 = '#c7c4a8';
    cs.text = '#3d3929';
    cs.accent1 = '#ad8b63';
    cs.accent2 = '#4b4848';
    cs.border1 = '#747474';
    cs.contrast = '#000000';
    cs.highlight = '#f3c092';

    this.changeColorVariables(cs);
    this.setThemeInternal({
      themeId: '',
      themeAuthor: 'efeenesc',
      themeIcon: '',
      themeName: 'Beige',
    });
  }

  /**
   * Saves the provided color scheme to local storage as a JSON string.
   * 
   * @param cs - The ColorScheme object to be saved.
   */
  private saveToLocalStorage(cs: ColorScheme): void {
    const jsonVal = JSON.stringify(cs);
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
