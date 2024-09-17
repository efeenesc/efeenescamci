import { Component, Input, ViewChild } from '@angular/core';
import { LocalStorageService } from '../../services/local-storage.service';
import { LoadingBarComponent } from '../loading-bar/loading-bar.component';
import { VsCardComponent } from '../vs-card/vs-card.component';
import { MagnifyingGlassComponent } from "../../icons/magnifying-glass/magnifying-glass.component";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";
import anime from 'animejs';

@Component({
  selector: 'vs-search',
  standalone: true,
  imports: [LoadingBarComponent, VsCardComponent, MagnifyingGlassComponent, SkeletonLoaderComponent],
  templateUrl: './vs-search.component.html'
})
export class VsSearchComponent {
  @ViewChild('themebtn') themeBtn!: HTMLElement;

  @Input('animationSeekAt') set _seek(s: number) {
    this.animationSeekAt = s;
    this.playScrollAnimation(this.animationSeekAt);
  }
  animationSeekAt: number = 0;

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

  playScrollAnimation(progress: number) {
    const pad = progress * 8 + 'px';

    anime({
      targets: '#vs-search-main',
      paddingLeft: pad,
      paddingTop: pad,
      paddingBottom: pad,
      duration: 10,
      easing: 'linear'
    })

    const opacity = progress;

    anime({
      targets: '#theme-author',
      opacity,
      duration: 10,
      easing: 'linear',
    })

    const top = (1-progress) * 1.2; 

    anime({
      targets: '#theme-name',
      top: top + 'vh',
      duration: 10,
      easing: 'linear'
    })
  }
}
