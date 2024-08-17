import { Injectable } from '@angular/core';
import * as vst from '../types/vs-types';
import { plainToInstance } from 'class-transformer';
import plist from 'plist';
import stripJsonComments from 'strip-json-comments';
import { ScopeFinder, ScopeFinderType } from '../classes/scopefinder';
import JSZip from 'jszip';
import { ColorScheme, ColorTheme } from '../classes/colorscheme';
import { LocalStorageService } from './local-storage.service';
import { ThemeMetadata, ThemePackage } from '../types/vs/manifest';

export type iconDownloadConfig = 'none' | 'small' | 'large'

@Injectable({
  providedIn: 'root',
})
export class VsThemeService {
  constructor(private _lss: LocalStorageService) {}

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
        },
        body: postBody,
      }
    );

    const jsonObj = await postResult.json() as Object;
    let finalObj = plainToInstance(vst.VSResultBody, jsonObj);

    if (downloadIcons !== 'none') {
      finalObj.results.map((result) => {
        result.extensions.map(async (ext) => 
          ext.extensionIcon = await this.getIcon(ext, downloadIcons)
        )
      })
    }

    return finalObj;
  };

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

  async changeTheme(
    ext: vst.VSExtension,
    progress?: (loaded: number, total: number) => void
  ) {
    const fileArray: any[] = ext.versions[0].files;
    const pkglink: string = fileArray.find(
      (thing) =>
        thing['assetType'] === 'Microsoft.VisualStudio.Services.VSIXPackage'
    )['source'];

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

    this._lss.set('theme_name', themeName);
    this._lss.set('theme_author', themeAuthor);
    this._lss.set('theme_id', themeId);
    this._lss.set('theme_icon', themeIcon);

    const themes = await this.readThemes(pkg_themes, zip);
    this._lss.set("themes", JSON.stringify(themes));
    this.changeColorVariables(themes[0]);
  }

  private async readThemes(themesList: ThemeMetadata[], zip: JSZip): Promise<ColorScheme[]> {
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
    }));

    return themePalettes;
  }
  
  async changeThemeJson(themeJson: string) {
    if (!themeJson || themeJson.length <= 0)
      return;

    try {
      const themeObj = JSON.parse(themeJson) as ColorScheme;
      this.changeColorVariables(themeObj);
    } catch (ex) {
      console.error(`Error while applying theme: ${ex}`);
    }
  }

  blobToBase64(blob: Blob): Promise<string | null | ArrayBuffer> {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async getIcon(ext: vst.VSExtension, iconSizePreference: 'small' | 'large' = 'small'): Promise<string | undefined | boolean> {
    let extUri;

    if (iconSizePreference === 'small') {
      extUri = ext.versions[0].files?.find(
        (prop) => prop.assetType === 'Microsoft.VisualStudio.Services.Icons.Small'
      )?.source;
    }
      
    if (iconSizePreference === 'large' || !extUri) {
      extUri = ext.versions[0].files?.find(
        (prop) => prop.assetType === 'Microsoft.VisualStudio.Services.Icons.Default'
      )?.source;
    }
    
    if (!extUri) return false;

    const res = await fetch(extUri);
    const blob = await res.blob();
    const base64 = await this.blobToBase64(blob);

    if (typeof base64 === 'string') return base64;

    return false;
  }

  private readPlistFile(filestr: string, colorTheme: ColorTheme): ColorScheme {
    const pfile = plist.parse(filestr);

    const sf = new ScopeFinder('plist', pfile);
    const cs = new ColorScheme(colorTheme);

    cs.darkest = sf.GetForeground('background')!;
    cs.darker = sf.GetForeground('editor.background')!;
    cs.dark = sf.GetForeground('input.background') || cs.darker;
    cs.text = sf.GetForeground('foreground')! || sf.GetForeground('constant.other')! || sf.GetForeground('variable.other.constant')! || sf.GetForeground('constant.other.color')! || sf.GetForeground('constant')!;
    cs.accent1 = sf.GetForeground('constant.language')!;
    cs.accent2 = sf.GetForeground('variable.parameter')!;
    cs.highlight = sf.GetForeground('lineHighlight')!;

    const b1 = sf.GetForeground('editor.border');
    if (b1) cs.border1 = b1;

    return cs;
  }

  private readJSONFile(filestr: string, colorTheme: ColorTheme): ColorScheme {
    const theme_json = JSON.parse(
      stripJsonComments(filestr, { trailingCommas: true })
    );

    const themec = theme_json['colors'];
    const tokenc = theme_json['tokenColors'];

    const sf = new ScopeFinder('json', tokenc);
    const cs = new ColorScheme(colorTheme);

    cs.darkest = themec['sideBar.background'];
    cs.darker = themec['editor.background'];
    cs.dark = themec['input.background'] || cs.darker;
    cs.text = sf.GetForeground('constant.other')! || sf.GetForeground('variable.other.constant')! || sf.GetForeground('constant.other.color')! || sf.GetForeground('constant')!;
    cs.accent1 = sf.GetForeground('string')!;
    cs.accent2 = sf.GetForeground('variable.parameter')!;
    cs.highlight = themec['editor.lineHighlightBackground']!;

    const b1 = sf.GetForeground('editor.border');
    if (b1) cs.border1 = b1;

    return cs;
  }

  changeColorVariables(cs: ColorScheme) {
    const root = document.documentElement;

    root.style.setProperty('--darkest', cs.darkest);
    root.style.setProperty('--darker', cs.darker);
    root.style.setProperty('--dark', cs.dark);
    root.style.setProperty('--foreground', cs.text);
    root.style.setProperty('--accent1', cs.accent1 === cs.text ? cs.accent2 || cs.accent1 : cs.accent1);
    root.style.setProperty('--accent2', cs.accent2);
    root.style.setProperty('--border1', cs.border1);

    root.style.setProperty('--contrast', cs.contrast);
    root.style.setProperty('--inverse', cs.inverse);
    
    root.style.setProperty('--highlight', cs.highlight);
    root.style.setProperty('--system', `color-mix(in srgb, ${cs.darkest} 50%, ${cs.system} 50%)`);
    
    
    this.saveToLocalStorage(cs);
  }

  private saveToLocalStorage(cs: ColorScheme): void {
    const jsonVal = JSON.stringify(cs);
    this._lss.set("theme_val", jsonVal);
  }

  getFromLocalStorage(): ColorScheme | undefined {
    const jsonVal = this._lss.get("theme_val");
    if (!jsonVal) return;

    const parsed = JSON.parse(jsonVal);
    return parsed as ColorScheme;
  }
}
