import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { VSExtension, VSFilterBody } from '../../types/vs-types';
import { VsThemeService } from '../../services/vs-theme.service';
import { CarouselComponent } from "../../components/carousel/carousel.component";
import { LocalStorageService } from '../../services/local-storage.service';
import { ArrowUpRightFromSquareComponent } from "../../icons/arrow-up-right-from-square/arrow-up-right-from-square.component";
import { CarouselItemComponent } from "../../components/carousel-item/carousel-item.component";
import { SkeletonLoaderComponent } from "../../components/skeleton-loader/skeleton-loader.component";
import { VsCardComponent } from "../../components/vs-card/vs-card.component";

@Component({
  selector: 'themes-section',
  standalone: true,
  imports: [CarouselComponent, ArrowUpRightFromSquareComponent, CarouselItemComponent, SkeletonLoaderComponent, VsCardComponent],
  templateUrl: './themes.component.html',
  styles: `
  :host {
    display: flex;
    width: 100%;
  }
  `
})
export class ThemesComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  favoriteThemes = [
    "c56274bf-4605-4ffe-8302-a1c94ca32e76", //Noir
    "f5d7ffda-c1d6-4070-ba80-803c705a1ee6", //Monokai Pro
    "71f8bc18-fb5f-401f-aa46-5a5484e605a7", //Pink-Cat-Boo Theme
    "469aea7c-9f56-40d2-bf75-2874886663be", //C64 Purple Pro
    "043cbe69-59a0-4952-a548-2366587a1226", //Github Theme
    "26a529c9-2654-4b95-a63f-02f6a52429e6", //One Dark Pro
    "undefined"
  ];
  placeholders = [...this.favoriteThemes.map(() => { return {} as VSExtension; })]
  currentThemeId?: string;

  constructor(private lss : LocalStorageService, private vs : VsThemeService) {}

  ngAfterContentInit() {
    this.currentThemeId = this.lss.get('theme_id')!;

    this.lss.valueChanges.subscribe((newVal) => {
      if (newVal.key === "theme_id") {
        this.currentThemeId = newVal.value;
      }
    })

    this.placeholders.forEach((_, idx) => {
      if (this.favoriteThemes[idx] !== "undefined") {
        let filter = new VSFilterBody();
        filter.addSearchFilter(this.favoriteThemes[idx]);
        filter.filters[0].pageSize = 1;
  
        this.vs.getFilteredResults(filter, 'large').then((val) => {
          if (val && val.results[0] && val.results[0].extensions[0])
            this.placeholders[idx] = val.results[0].extensions[0];
        })
      }
    })
  }

  async getTheme(id: string) {
    let filter = new VSFilterBody();
    filter.addSearchFilter(id);
    filter.filters[0].pageSize = 1;
    const response = await this.vs.getFilteredResults(filter);
    if (response!.results.length === 0)
      return;

    return response!.results[0];
  }

  itemSelected(ext: VSExtension) {
    this.vs.changeTheme(ext);
  }
}
