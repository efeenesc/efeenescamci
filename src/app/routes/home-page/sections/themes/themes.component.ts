import { Component, ElementRef, ViewChild } from '@angular/core';
import { VSExtension, VSFilterBody } from '../../../../types/vs-types';
import { VsThemeService } from '../../../../services/vs-theme.service';
import { CarouselComponent } from '../../../../components/carousel/carousel.component';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { ArrowUpRightFromSquareComponent } from '../../../../icons/arrow-up-right-from-square/arrow-up-right-from-square.component';
import { CarouselItemComponent } from '../../../../components/carousel-item/carousel-item.component';
import { SkeletonLoaderComponent } from '../../../../components/skeleton-loader/skeleton-loader.component';
import {
  VsCardComponent,
  VsCardStyle,
} from '../../../../components/vs-card/vs-card.component';
import { DeferLoadDirective } from '../../../../classes/deferload';

@Component({
  selector: 'themes-section',
  standalone: true,
  imports: [
    CarouselComponent,
    ArrowUpRightFromSquareComponent,
    CarouselItemComponent,
    SkeletonLoaderComponent,
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
    extensionIcon:
      'data:image/jpeg;base64,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',
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
    bg300Class: 'bg-theme-300',
    bg900Class: 'bg-theme-900',
    fgTextClass: 'text-foreground',
    fgTextAccent: 'text-accent1',
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
