import { Component, ElementRef, ViewChild } from '@angular/core';
import { VSExtension, VSFilterBody } from '../../../../types/vs-types';
import { VsThemeService } from '../../../../services/vs-theme.service';
import { CarouselComponent } from '../../../../components/carousel/carousel.component';
import { LocalStorageService } from '../../../../services/local-storage.service';
import {
  VsCardComponent,
  VsCardStyle,
} from '../../../../components/vs-card/vs-card.component';
import { DeferLoadDirective } from '../../../../classes/deferload';
import beigeIcon from '../../../../icons/beige-theme-icon/beigeiconb64';

@Component({
  selector: 'themes-section',
  standalone: true,
  imports: [
    CarouselComponent,
    VsCardComponent,
    DeferLoadDirective,
  ],
  templateUrl: './themes.component.html',
  styles: `
  :host {
    display: flex;
    width: 100%;
  }
  `,
})
export class ThemesComponent {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  favoriteThemes = [
    'c56274bf-4605-4ffe-8302-a1c94ca32e76', // Noir
    'f5d7ffda-c1d6-4070-ba80-803c705a1ee6', // Monokai Pro
    '71f8bc18-fb5f-401f-aa46-5a5484e605a7', // Pink-Cat-Boo Theme
    '469aea7c-9f56-40d2-bf75-2874886663be', // C64 Purple Pro
    '043cbe69-59a0-4952-a548-2366587a1226', // GitHub Theme
    '26a529c9-2654-4b95-a63f-02f6a52429e6', // One Dark Pro
  ];
  defaultTheme: VSExtension = {
    publisher: {
      displayName: 'efeenesc',
      publisherId: '00000000-0000-0000-0000-000000000000',
      publisherName: 'efeenesc',
      flags: '0',
      isDomainVerified: true,
      domain: 'efeenescamci.com',
    },
    extensionId: '00000000-0000-0000-0000-000000000000',
    extensionName: 'Beige',
    displayName: 'Beige',
    extensionIcon: beigeIcon,
    flags: '0',
    lastUpdated: '',
    publishedDate: '',
    releaseDate: '',
    shortDescription: '',
    versions: [],
    categories: [],
    tags: [],
    statistics: [],
    deploymentType: 0,
  };
  placeholders = this.favoriteThemes.map(() => {
    return {} as VSExtension;
  });
  vsCardTheme: VsCardStyle = new VsCardStyle({
    bg300Class: 'bg-theme-900',
    bg900Class: 'bg-theme-900',
    fgTextClass: 'text-foreground',
    fgTextAccent: 'text-accent1',
    fgSvg: '[&_svg]:fill-accent1'
  });
  currentThemeId?: string;

  constructor(private lss: LocalStorageService, private vs: VsThemeService) {}

  async beginLoading() {
    this.currentThemeId = this.lss.get('theme_id')!;

    this.lss.valueChanges.subscribe((newVal) => {
      if (newVal.key === 'theme_id') {
        this.currentThemeId = newVal.value;
      }
    });

    this.placeholders.unshift(this.defaultTheme);

    await Promise.all(
      this.favoriteThemes.map(async (themeId, idx) => {
        if (themeId !== 'undefined') {
          const filter = new VSFilterBody();
          filter.addSearchFilter(themeId);
          filter.filters[0].pageSize = 1;

          const val = await this.vs.getFilteredResults(filter, 'large');

          // +1 because default theme is unshifted at the start
          if (val && val.results[0] && val.results[0].extensions[0]) {
            this.placeholders[idx + 1] = val.results[0].extensions[0];
          }
        }
      })
    );
  }

  async getTheme(id: string) {
    const filter = new VSFilterBody();
    filter.addSearchFilter(id);
    filter.filters[0].pageSize = 1;
    const response = await this.vs.getFilteredResults(filter);
    if (response!.results.length === 0) return;

    return response!.results[0];
  }
}
