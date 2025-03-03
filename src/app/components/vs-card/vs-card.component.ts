import {
  Component,
  effect,
  ElementRef,
  input,
  NgZone,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { VSExtension } from '../../types/vs-types';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { ArrowUpRightFromSquareComponent } from '../../icons/arrow-up-right-from-square/arrow-up-right-from-square.component';
import { VsThemeService } from '../../services/vs-theme.service';
import beigeIcon from '../../icons/beige-theme-icon/beigeiconb64';
import gsap from 'gsap';

export interface VsCardStyleProps {
  bg900Class?: string;
  bg300Class?: string;
  fgTextClass?: string;
  fgTextAccent?: string;
  fgSvg?: string;
}

export class VsCardStyle {
  bg900 = 'bg-system-900';
  bg300 = 'bg-system-700';
  fgText = 'text-contrast';
  fgAccent = 'text-contrast text-bold';
  fgSvg = '[&_svg]:fill-contrast';
  constructor(props?: VsCardStyleProps) {
    if (!props) return;
    if (props.bg900Class) this.bg900 = props.bg900Class;
    if (props.bg300Class) this.bg300 = props.bg300Class;
    if (props.fgTextClass) this.fgText = props.fgTextClass;
    if (props.fgTextAccent) this.fgAccent = props.fgTextAccent;
    if (props.fgSvg) this.fgSvg = props.fgSvg;
  }
}

@Component({
  selector: 'vs-card',
  imports: [SkeletonLoaderComponent, ArrowUpRightFromSquareComponent],
  templateUrl: './vs-card.component.html',
})
export class VsCardComponent implements OnDestroy {
  @ViewChild('themeinfo') set _dm(content: ElementRef) {
    this.themeInfoDiv = content.nativeElement;
  }
  themeInfoDiv!: HTMLDivElement;

  @ViewChild('loadingcontainer') set _lc(content: ElementRef) {
    this.loadingContainerDiv = content.nativeElement;
  }
  loadingContainerDiv!: HTMLDivElement;

  @ViewChild('shadowcontainer') set _sc(content: ElementRef) {
    this.shadowContainerDiv = content.nativeElement;
  }
  shadowContainerDiv!: HTMLDivElement;

  @ViewChild('maincontainer') set _mc(content: ElementRef) {
    this.mainContainerDiv = content.nativeElement;
  }
  mainContainerDiv!: HTMLDivElement;

  @ViewChild('background') set _bg(content: ElementRef) {
    this.backgroundDiv = content.nativeElement;
  }
  backgroundDiv!: HTMLDivElement;

  @ViewChild('loadingdiv') set _ld(content: ElementRef) {
    this.loadingDiv = content.nativeElement;
  }
  loadingDiv!: HTMLDivElement;

  cardInfo = input.required<VSExtension>();
  cardType = input<'small' | 'large'>('large');
  cardStyle = input<VsCardStyle>();

  abortController: AbortController | null = null;

  bg900 = signal<string>('bg-system-900');
  bg300 = signal<string>('bg-system-700');
  fgText = signal<string>('text-contrast');
  fgAccent = signal<string>(
    'text-neutral-400 text-bold border-neutral-400 [&_svg]:fill-neutral-400'
  );
  currentProgress = 0;
  downloadProgress = 0;
  downloadProgressObj = { current: 0 };

  constructor(private vs: VsThemeService, private ngZone: NgZone) {
    effect(() => {
      if (!this.cardStyle()) return;
      this.bg900.set(this.cardStyle()!.bg900);
      this.bg300.set(this.cardStyle()!.bg300);
      this.fgText.set(this.cardStyle()!.fgText);
      this.fgAccent.set(this.cardStyle()!.fgAccent);
    });
  }

  themeSelected(event: { target: EventTarget | null }) {
    if ((event.target as HTMLElement).tagName === 'A') return;

    if (
      this.cardInfo().displayName === 'Beige' &&
      this.cardInfo().publisher.displayName === 'efeenesc'
    ) {
      this.vs.setDefaultColorScheme('default', beigeIcon);
    } else {
      this.itemSelected(this.cardInfo());
    }
  }

  keyPressed(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.themeSelected(event);
    }
  }

  itemSelected(ext: VSExtension) {
    this.abortController = new AbortController();
    this.resetLoadingBarNoAnim();
    this.currentProgress = 0;
    this.downloadProgress = 0;
    this.downloadProgressObj = { current: 0 };
    this.startLoadingAnimation();
    this.vs.changeTheme(ext, (loaded, total) => {
      const progress = parseInt((loaded / total) * 100 + ''); // Working with float in JS is never good. Convert to string then int

      if (this.downloadProgress > progress)
        // Failsafe
        return;

      this.downloadProgress = progress;
      this.setCalculatedGradient(this.downloadProgress);
    });
  }

  cancelThemeChange() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.stopLoadingAnimation();
    }
  }

  resetLoadingBarNoAnim() {
    this.loadingDiv.style.background = '';
  }

  startLoadingAnimation() {
    this.ngZone.runOutsideAngular(() => {
      gsap.to(this.shadowContainerDiv, {
        opacity: 0,
        duration: 0.05,
      });
      gsap.to(this.mainContainerDiv, {
        translateY: '0.25rem',
        duration: 0.05,
      });

      // Fade in the loading containerQ
      gsap.to(this.loadingContainerDiv, {
        opacity: 1,
        duration: 0.05,
      });

      // Scale the theme info div
      gsap.to(this.backgroundDiv, {
        opacity: 0,
        duration: 1,
        ease: 'power1.inOut',
      });
    });
  }

  stopLoadingAnimation() {
    this.ngZone.runOutsideAngular(() => {
      gsap.to(this.mainContainerDiv, {
        translateY: 0,
        duration: 0.05,
      });
      gsap.to(this.shadowContainerDiv, {
        opacity: 1,
        duration: 0.05,
      });
      gsap.to(this.loadingContainerDiv, {
        opacity: 0,
        duration: 0.5,
      });

      // Second animation (scale the theme info div back to 1.0)
      gsap.to(this.backgroundDiv, {
        opacity: 1,
        duration: 1,
        ease: 'power1.inOut',
      });
    });
  }

  setCalculatedGradient(downloadProgress: number) {
    this.ngZone.runOutsideAngular(() => {
      gsap.to(this.downloadProgressObj, {
        current: downloadProgress,
        ease: 'power1.out', // Equivalent to 'easeOutQuad' in GSAP
        duration: 0.1, // 100ms converted to seconds (0.1s)
        onUpdate: () => {
          this.currentProgress = this.downloadProgressObj.current;
          this.loadingDiv.style.background = `conic-gradient(#3b82f6 ${this.currentProgress}% 0, transparent 0%)`;

          if (this.currentProgress === 100) {
            setTimeout(() => {
              // console.log(this.currentProgress);
              this.stopLoadingAnimation();
            }, 250);
          }
        },
      });
    });
  }

  ngOnDestroy() {
    // console.log("Card destroyed?");
    this.cancelThemeChange();
  }
}
