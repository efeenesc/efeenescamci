import { Component, Input, ViewChild } from '@angular/core';
import { VsThemeService } from '../../services/vs-theme.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { LoadingBarComponent } from '../loading-bar/loading-bar.component';
import { VsCardComponent } from '../vs-card/vs-card.component';
import { MagnifyingGlassComponent } from "../../icons/magnifying-glass/magnifying-glass.component";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'vs-search',
  standalone: true,
  imports: [LoadingBarComponent, VsCardComponent, MagnifyingGlassComponent, SkeletonLoaderComponent],
  templateUrl: './vs-search.component.html'
})
export class VsSearchComponent {
  @ViewChild('themebtn') themeBtn!: HTMLElement;
  @Input() internalStyle?: string;
  themeName?: string | null;
  themeAuthor?: string | null;
  themeIcon?: string | null;

  constructor(
    private _lss: LocalStorageService
  ) {}

  ngOnInit() {
    this.restoreThemeInformation();
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
  }

  restoreThemeInformation() {
    this.themeAuthor = this._lss.get("theme_author");
    this.themeName = this._lss.get("theme_name");
    this.themeIcon = 'data:image/png;base64,' + this._lss.get("theme_icon");
  }
}
