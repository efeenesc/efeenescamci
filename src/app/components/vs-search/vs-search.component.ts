import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ScopeFinder } from '../../classes/scopefinder';
import { VsThemeService } from '../../services/vs-theme.service';
import * as vst from '../../types/vs-types';
import anime from 'animejs';
import { LocalStorageService } from '../../services/local-storage.service';
import { LoadingBarComponent } from '../loading-bar/loading-bar.component';
import { GetSetObj } from '../../classes/getsetobj';
import { VsCardComponent } from '../vs-card/vs-card.component';
import { MagnifyingGlassComponent } from "../../icons/magnifying-glass/magnifying-glass.component";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";

const AsyncFunction = (async () => {}).constructor;

@Component({
  selector: 'vs-search',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, LoadingBarComponent, VsCardComponent, MagnifyingGlassComponent, SkeletonLoaderComponent],
  templateUrl: './vs-search.component.html',
  styleUrl: './vs-search.component.css',
})
export class VsSearchComponent {
  @ViewChild('themebtn') themeBtn!: HTMLElement;
  themeName?: string | null;
  themeAuthor?: string | null;
  themeIcon?: string | null;
  results?: vst.VSExtension;
  searchControl!: FormControl;
  searchDebounce: number = 500;
  hoverDebounce: number = 250;
  suppressHover: boolean = false;
  suppressClick: boolean = false;
  mouseHover: Subject<boolean> = new Subject();
  mouseDown: Subject<boolean> = new Subject();
  searchFilter: vst.VSFilterBody = new vst.VSFilterBody();
  searchResults!: vst.VSResultBody | null;
  searching: boolean = false;
  hoverState: GetSetObj<boolean> = new GetSetObj<boolean>(
    false,
    this.playHoverEffect
  );
  fullscreen: GetSetObj<boolean> = new GetSetObj<boolean>(
    false,
    this.displayFullscreenAnimation
  );
  displayLoading: GetSetObj<boolean> = new GetSetObj<boolean>(
    false,
    this.playLoadingAnimation
  );
  mouseDownState: GetSetObj<boolean> = new GetSetObj<boolean>(
    false,
    this.playMouseDownAnimation
  )
  downloadPercent: number = 0;
  buttonCoords?: { left: number; top: number };

  constructor(
    private vsSvc: VsThemeService,
    private _lss: LocalStorageService
  ) {}
  example: vst.VSExtension = {
    publisher: {
      publisherId: '8ae75bda-ec22-4a17-9340-abf1a20beca9',
      publisherName: 'zhuangtongfa',
      displayName: 'binaryify',
      flags: 'verified',
      domain: null,
      isDomainVerified: false,
    },
    extensionId: '26a529c9-2654-4b95-a63f-02f6a52429e6',
    extensionName: 'Material-theme',
    displayName: 'One Dark Pro',
    flags: 'validated, public',
    lastUpdated: '2024-04-25T06:41:10.673+00:00',
    publishedDate: '2015-11-20T08:02:40.517+00:00',
    releaseDate: '2015-11-20T08:02:40.517+00:00',
    shortDescription: "Atom's iconic One Dark theme for Visual Studio Code",
    versions: [
      {
        version: '3.17.2',
        flags: 'validated',
        lastUpdated: '2024-04-25T06:41:10.67Z',
        files: [
          {
            assetType: 'Microsoft.VisualStudio.Code.Manifest',
            source:
              'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547/Microsoft.VisualStudio.Code.Manifest',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.Content.Changelog',
            source:
              'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547/Microsoft.VisualStudio.Services.Content.Changelog',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.Content.Details',
            source:
              'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547/Microsoft.VisualStudio.Services.Content.Details',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.Content.License',
            source:
              'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547/Microsoft.VisualStudio.Services.Content.License',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.Icons.Default',
            source:
              'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547/Microsoft.VisualStudio.Services.Icons.Default',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.Icons.Small',
            source:
              'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547/Microsoft.VisualStudio.Services.Icons.Small',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.VsixManifest',
            source:
              'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547/Microsoft.VisualStudio.Services.VsixManifest',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.VSIXPackage',
            source:
              'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547/Microsoft.VisualStudio.Services.VSIXPackage',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.VsixSignature',
            source:
              'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547/Microsoft.VisualStudio.Services.VsixSignature',
          },
        ],
        properties: [
          {
            key: 'Microsoft.VisualStudio.Services.Branding.Color',
            value: '#2d323b',
          },
          {
            key: 'Microsoft.VisualStudio.Services.Branding.Theme',
            value: 'dark',
          },
          {
            key: 'Microsoft.VisualStudio.Services.Links.Getstarted',
            value: 'https://github.com/Binaryify/OneDark-Pro.git',
          },
          {
            key: 'Microsoft.VisualStudio.Services.Links.Support',
            value: 'https://github.com/Binaryify/OneDark-Pro/issues',
          },
          {
            key: 'Microsoft.VisualStudio.Services.Links.Learn',
            value: 'https://binaryify.github.io/OneDark-Pro/',
          },
          {
            key: 'Microsoft.VisualStudio.Services.Links.Source',
            value: 'https://github.com/Binaryify/OneDark-Pro.git',
          },
          {
            key: 'Microsoft.VisualStudio.Services.Links.GitHub',
            value: 'https://github.com/Binaryify/OneDark-Pro.git',
          },
          {
            key: 'Microsoft.VisualStudio.Code.Engine',
            value: '^1.76.0',
          },
          {
            key: 'Microsoft.VisualStudio.Services.GitHubFlavoredMarkdown',
            value: 'true',
          },
          {
            key: 'Microsoft.VisualStudio.Code.ExtensionDependencies',
            value: '',
          },
          {
            key: 'Microsoft.VisualStudio.Code.ExtensionPack',
            value: '',
          },
          {
            key: 'Microsoft.VisualStudio.Code.LocalizedLanguages',
            value: '',
          },
          {
            key: 'Microsoft.VisualStudio.Code.ExtensionKind',
            value: 'ui,workspace,web',
          },
        ],
        assetUri:
          'https://zhuangtongfa.gallerycdn.vsassets.io/extensions/zhuangtongfa/material-theme/3.17.2/1714027119547',
        fallbackAssetUri:
          'https://zhuangtongfa.gallery.vsassets.io/_apis/public/gallery/publisher/zhuangtongfa/extension/Material-theme/3.17.2/assetbyname',
      },
    ],
    categories: ['Themes'],
    tags: [
      '__web_extension',
      'atom',
      'color-theme',
      'one dark',
      'one dark pro',
      'OneDark',
      'onedark pro',
      'theme',
    ],
    statistics: [
      {
        statisticName: 'install',
        value: 9452493,
      },
      {
        statisticName: 'averagerating',
        value: 4.65217399597168,
      },
      {
        statisticName: 'ratingcount',
        value: 207,
      },
      {
        statisticName: 'trendingdaily',
        value: 0.0012806678947672016,
      },
      {
        statisticName: 'trendingmonthly',
        value: 1.3929431607896365,
      },
      {
        statisticName: 'trendingweekly',
        value: 0.2728774601122309,
      },
      {
        statisticName: 'updateCount',
        value: 60270672,
      },
      {
        statisticName: 'weightedRating',
        value: 4.640700757876638,
      },
      {
        statisticName: 'downloadCount',
        value: 42022,
      },
    ],
    deploymentType: 0,
  };
  example2: vst.VSExtension = {
    publisher: {
      publisherId: '589972e6-94fd-413e-a160-4af5b4095235',
      publisherName: 'thomaspink',
      displayName: 'Thomas Pink',
      flags: 'verified',
      domain: null,
      isDomainVerified: false,
    },
    extensionId: '043cbe69-59a0-4952-a548-2366587a1226',
    extensionName: 'theme-github',
    displayName: 'Github Theme',
    flags: 'validated, public',
    lastUpdated: '2017-08-04T06:59:34.403+00:00',
    publishedDate: '2017-08-03T09:29:36.267+00:00',
    releaseDate: '2017-08-03T09:29:36.267+00:00',
    shortDescription: 'GitHub Theme for Visual Studio Code',
    versions: [
      {
        version: '1.0.1',
        flags: 'validated',
        lastUpdated: '2017-08-04T06:59:34.423Z',
        files: [
          {
            assetType: 'Microsoft.VisualStudio.Code.Manifest',
            source:
              'https://thomaspink.gallerycdn.vsassets.io/extensions/thomaspink/theme-github/1.0.1/1501829974043/Microsoft.VisualStudio.Code.Manifest',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.Content.Details',
            source:
              'https://thomaspink.gallerycdn.vsassets.io/extensions/thomaspink/theme-github/1.0.1/1501829974043/Microsoft.VisualStudio.Services.Content.Details',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.Content.License',
            source:
              'https://thomaspink.gallerycdn.vsassets.io/extensions/thomaspink/theme-github/1.0.1/1501829974043/Microsoft.VisualStudio.Services.Content.License',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.Icons.Default',
            source:
              'https://thomaspink.gallerycdn.vsassets.io/extensions/thomaspink/theme-github/1.0.1/1501829974043/Microsoft.VisualStudio.Services.Icons.Default',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.Icons.Small',
            source:
              'https://thomaspink.gallerycdn.vsassets.io/extensions/thomaspink/theme-github/1.0.1/1501829974043/Microsoft.VisualStudio.Services.Icons.Small',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.VSIXPackage',
            source:
              'https://thomaspink.gallerycdn.vsassets.io/extensions/thomaspink/theme-github/1.0.1/1501829974043/Microsoft.VisualStudio.Services.VSIXPackage',
          },
          {
            assetType: 'Microsoft.VisualStudio.Services.VsixSignature',
            source:
              'https://thomaspink.gallerycdn.vsassets.io/extensions/thomaspink/theme-github/1.0.1/1501829974043/Microsoft.VisualStudio.Services.VsixSignature',
          },
        ],
        properties: [
          {
            key: 'Microsoft.VisualStudio.Services.Links.Getstarted',
            value: 'https://github.com/thomaspink/vscode-github-theme',
          },
          {
            key: 'Microsoft.VisualStudio.Services.Links.Source',
            value: 'https://github.com/thomaspink/vscode-github-theme',
          },
          {
            key: 'Microsoft.VisualStudio.Services.Links.GitHub',
            value: 'https://github.com/thomaspink/vscode-github-theme',
          },
          {
            key: 'Microsoft.VisualStudio.Code.Engine',
            value: '*',
          },
          {
            key: 'Microsoft.VisualStudio.Services.GitHubFlavoredMarkdown',
            value: 'true',
          },
          {
            key: 'Microsoft.VisualStudio.Code.ExtensionDependencies',
            value: '',
          },
        ],
        assetUri:
          'https://thomaspink.gallerycdn.vsassets.io/extensions/thomaspink/theme-github/1.0.1/1501829974043',
        fallbackAssetUri:
          'https://thomaspink.gallery.vsassets.io/_apis/public/gallery/publisher/thomaspink/extension/theme-github/1.0.1/assetbyname',
      },
    ],
    categories: ['Themes'],
    tags: ['__web_extension', 'color-theme', 'theme'],
    statistics: [
      {
        statisticName: 'install',
        value: 110334,
      },
      {
        statisticName: 'averagerating',
        value: 5,
      },
      {
        statisticName: 'ratingcount',
        value: 6,
      },
      {
        statisticName: 'trendingdaily',
        value: 0.0009065032543466832,
      },
      {
        statisticName: 'trendingmonthly',
        value: 1.1059339703029534,
      },
      {
        statisticName: 'trendingweekly',
        value: 0.23387783962144423,
      },
      {
        statisticName: 'updateCount',
        value: 2248,
      },
      {
        statisticName: 'weightedRating',
        value: 4.627002955818295,
      },
      {
        statisticName: 'downloadCount',
        value: 242,
      },
    ],
    deploymentType: 0,
  };

  ngOnInit() {
    // this.searchVSMarketplace("GitHub");
    // this.themeSelected(this.example2);
    // this.buttonClicked();
    this.restoreLastTheme();
    this._lss.valueChanges.subscribe((obj) => {
      switch (obj.key) {
        case 'theme_author':
          this.themeAuthor = obj.value;
          break;

        case 'theme_name':
          this.themeName = obj.value;
          break;

        case 'theme_icon':
          this.themeIcon = 'data:image/png;base64,' + obj.value;
          break;
      }
    });

    this.searchControl = new FormControl('');
    this.searchControl.valueChanges
      .pipe(debounceTime(this.searchDebounce), distinctUntilChanged())
      .subscribe((query: string) => {
        this.searching = true;
        this.searchVSMarketplace(query)
        .then(() => this.searching = false);
      });

    this.mouseHover
      .pipe(debounceTime(this.hoverDebounce), distinctUntilChanged())
      .subscribe((newState) => {
        if (!this.suppressHover) this.hoverState.value = newState;
      });

    this.mouseDown
      .pipe(debounceTime(this.hoverDebounce), distinctUntilChanged())
      .subscribe((newState) => {
        this.mouseDownState.value = newState;
      });
  }

  restoreLastTheme() {
    const cs = this.vsSvc.getFromLocalStorage();
    if (!cs) return;
    this.vsSvc.changeColorVariables(cs);

    this.themeAuthor = this._lss.get("theme_author");
    this.themeName = this._lss.get("theme_name");
    this.themeIcon = 'data:image/png;base64,' + this._lss.get("theme_icon");
  }

  playMouseDownAnimation(state: boolean) {
    if (state) {
      anime({
        targets: "#themebtn",
        duration: 100,
        easing: 'easeInOutQuad'
      })
    } else {
      anime({
        targets: "#themebtn",
        duration: 100,
        easing: 'easeInOutQuad'
      })
    }
  }

  playHoverEffect(expand: boolean) {
    if (this.suppressHover) return;

    const heightChange = expand ? '+=2vh' : '-=2vh';
    const widthChange = expand ? '+=4vw' : '-=4vw';
    const padChange = expand ? '+=10px' : '-=10px';
    const gapChange = expand ? '+=20px' : '-=20px';
    const opacityChange = expand ? '1.00' : '0.00';

    setTimeout(() => {
      anime({
        targets: '#themebtn',
        width: widthChange,
        height: heightChange,
        padding: padChange,
        gap: gapChange,
        duration: 250,
        easing: 'easeOutElastic(1, 1.2)',
      });
      anime({
        targets: '#theme-select',
        opacity: opacityChange,
        duration: 250,
        easing: 'easeInOutQuad',
      });
    }, 0);
  }

  playLoadingAnimation(show: boolean) {
    const opacityChange = show ? '1' : '0';

    setTimeout(() => {
      anime({
        targets: '#extrablur',
        opacity: opacityChange,
        duration: 150,
        easing: 'easeInOutQuad',
      });
    }, 0);
  }

  buttonClicked() {
    if (this.suppressClick) return;
    this.fullscreen.value = true;
    this.hoverState.value = true;
    this.suppressClick = true;
    this.suppressHover = true;
    setTimeout(() => {
      anime({
        targets: '#fullscreen',
        opacity: 1,
        easing: 'easeOutQuad',
        duration: 250,
      });

      const widthChange = '+=5vw';
      const placeholderCard = document.getElementById('placeholder_card')!;
      const actualCard = document.getElementById('themebtn')!;
      const { left, top } = placeholderCard.getBoundingClientRect();
      this.buttonCoords = actualCard.getBoundingClientRect();
      placeholderCard.style.height = '12vh';

      anime({
        targets: '#theme-select',
        opacity: 0,
        duration: 250,
        easing: 'easeInOutQuad',
      });

      anime({
        targets: '#themebtn',
        left: left,
        top: top,
        width: widthChange,
        height: '12vh',
        duration: 500,
        easing: 'easeInOutQuad',
        fontSize: '+=0.5em',
      });
    }, 0);
  }

  mouseLeftEvent() {
    this.mouseHover.next(false);
  }
  mouseEnteredEvent() {
    this.mouseHover.next(true);
  }

  mouseDownEvent() {
    this.mouseDown.next(true);
  }
  mouseUpEvent() {
    this.mouseDown.next(false);
  }

  displayFullscreenAnimation(show: boolean) : Promise<void> {
    document.getElementById('main')!.style.paddingRight = show ? '10px' : '';
    document.body.style.overflow = show ? 'hidden' : '';
    
    return new Promise((resolve, _) => {
      const opacity = show ? 10 : 0;
      setTimeout(() => {
        anime({
          targets: '#fullscreen',
          opacity: opacity,
          easing: 'easeOutQuad',
          duration: 250,
          complete: () => {
            resolve();
          }
        });

        if(show) resolve();
      });
    })
  }

  clickedOutside(event: MouseEvent) {
    if (!this.suppressClick) return;
    if (!(event.target as HTMLDivElement).id.includes("fullscreen")) return;
    this.fullscreen.value = false;

    setTimeout(() => {
      const widthChange = '-=5vw';

      anime({
        targets: '#themebtn',
        left: this.buttonCoords?.left,
        top: this.buttonCoords?.top,
        width: widthChange,
        height: '12vh',
        duration: 500,
        easing: 'easeInOutQuad',
        fontSize: '-=0.5em',
      }).finished.then(() => {
        document.getElementById('themebtn')!.style.removeProperty('left');

        setTimeout(() => {
          this.hoverState.value = false;
          setTimeout(() => {
            this.suppressClick = false;
            this.suppressHover = false;
          });
        }, 0);
      });
    }, 0);
  }

  async searchVSMarketplace(query: string) {
    this.searchFilter.addSearchFilter(query);
    this.searchResults = await this.vsSvc.getFilteredResults(this.searchFilter);
  }

  async themeSelected(ext: vst.VSExtension, showLoading: boolean = false) {
    if (showLoading) this.displayLoading.value = true;

    try {
      await this.vsSvc.changeTheme(ext, (loaded, total) => {
        this.downloadPercent = Math.round((loaded / total) * 100);
      });
    } catch (err) {
      console.error('ERROR', err);
    } finally {
      if (showLoading) {
        this.displayLoading.value = false;
        this.downloadPercent = 0;
      }
    }
  }
}
