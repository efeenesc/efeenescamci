import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { LocalStorageService } from '../../services/local-storage.service';
import gsap from 'gsap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'vs-search',
  imports: [],
  templateUrl: './vs-search.component.html',
})
export class VsSearchComponent implements OnDestroy {
  @ViewChild('themebtn') themeBtn!: HTMLElement;

  @Input('animationSeekAt') set _seek(s: number) {
    this.animationSeekAt = s;
    this.playScrollAnimation(this.animationSeekAt);
  }
  animationSeekAt: number = 0;

  @Input() internalStyle?: string;
  @Input() displayKeys: boolean = true;

  themeName?: string | null;
  themeAuthor?: string | null;
  themeIcon?: string | null;

  valueChangesSubscription!: Subscription;

  constructor(private _lss: LocalStorageService) {}

  ngOnInit() {
    this.restoreThemeInformation();
    this.valueChangesSubscription = this._lss.valueChanges.subscribe((obj) => {
      switch (obj.key) {
        case 'theme_author':
          this.themeAuthor = obj.value;
          break;

        case 'theme_name':
          this.themeName = obj.value;
          break;

        case 'theme_icon':
          if (obj.value.startsWith('data:image')) {
            this.themeIcon = obj.value;
          } else {
            this.themeIcon = 'data:image/png;base64,' + obj.value;
          }
          break;
      }
    });
  }

  restoreThemeInformation() {
    this.themeAuthor = this._lss.get('theme_author');
    this.themeName = this._lss.get('theme_name');
    const themeIcon = this._lss.get('theme_icon');
    if (!themeIcon) return;

    if (themeIcon.startsWith('data:image')) {
      this.themeIcon = themeIcon;
    } else {
      this.themeIcon = 'data:image/png;base64,' + themeIcon;
    }
  }

  playScrollAnimation(progress: number) {
    const pad = progress * 8 + 'px';

    gsap.to('#vs-search-main', {
      paddingLeft: pad,
      paddingTop: pad,
      paddingBottom: pad,
      duration: 0.01,
      ease: 'none',
    });

    gsap.to('#theme-author', {
      opacity: progress,
      duration: 0.01,
      ease: 'none',
    });

    const top = (1 - progress) * 1.2;

    gsap.to('#theme-name', {
      top: top + 'vh',
      duration: 0.01,
      ease: 'none',
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription.unsubscribe();
  }
}
