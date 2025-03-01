import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { VSExtension } from '../../types/vs-types';
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";
import { ArrowUpRightFromSquareComponent } from '../../icons/arrow-up-right-from-square/arrow-up-right-from-square.component';
import { VsThemeService } from '../../services/vs-theme.service';
import beigeIcon from '../../icons/beige-theme-icon/beigeiconb64';
import gsap from 'gsap';

export type VsCardStyleProps = {
  bg900Class?: string,
  bg300Class?: string,
  fgTextClass?: string,
  fgTextAccent?: string,
  fgSvg?: string
}

export class VsCardStyle {
  bg900: string = "bg-system-900";
  bg300: string = "bg-system-700";
  fgText: string = "text-contrast";
  fgAccent: string = "text-contrast text-bold";
  fgSvg: string = "[&_svg]:fill-contrast"
  constructor (
    props?: VsCardStyleProps
  ) {
    if (!props) return;

    if (props.bg900Class)
      this.bg900 = props.bg900Class;

    if (props.bg300Class)
      this.bg300 = props.bg300Class;

    if (props.fgTextClass)
      this.fgText = props.fgTextClass;

    if (props.fgTextAccent)
      this.fgAccent = props.fgTextAccent;

    if (props.fgSvg)
      this.fgSvg = props.fgSvg;
  }
}

@Component({
    selector: 'vs-card',
    imports: [SkeletonLoaderComponent, ArrowUpRightFromSquareComponent],
    templateUrl: './vs-card.component.html'
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

  @Input() cardInfo!: VSExtension;
  @Input() cardType: 'small' | 'large' = 'large'
  @Input('cardStyle') set _style(content: VsCardStyle) {
    this.bg900 = content.bg900;
    this.bg300 = content.bg300;
    this.fgText = content.fgText;
    this.fgAccent = content.fgAccent;
  }

  abortController: AbortController | null = null;

  bg900: string = "bg-system-900";
  bg300: string = "bg-system-700";
  fgText: string = "text-contrast";
  fgAccent: string = "text-neutral-400 text-bold border-neutral-400 [&_svg]:fill-neutral-400";

  calculatedGradient: string = '';
  currentProgress: number = 0;
  downloadProgress: number = 0;
  downloadProgressObj = { current: 0 };

  constructor (private vs : VsThemeService) {}

  themeSelected() {
    if (this.cardInfo.displayName === 'Beige' && this.cardInfo.publisher.displayName === 'efeenesc') {
      this.vs.setDefaultColorScheme('default', beigeIcon);
    } else {
      this.itemSelected(this.cardInfo);
    }
  }

  itemSelected(ext: VSExtension) {
    this.abortController = new AbortController();

    this.calculatedGradient = '';
    this.currentProgress = 0;
    this.downloadProgress = 0;
    this.downloadProgressObj = { current: 0 };
    this.startLoadingAnimation();
    this.vs.changeTheme(ext, (loaded, total) => {
      const progress = parseInt((loaded / total) * 100 + ''); // Working with float in JS is never good. Convert to string then int

      if (this.downloadProgress > progress) // Failsafe
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

  startLoadingAnimation() {
    // Fade in the loading container
    gsap.to(this.shadowContainerDiv, {
      opacity: 0,
      duration: 0.05
    });
    gsap.to(this.mainContainerDiv, {
      translateY: "0.25rem",
      duration: 0.05
    });
    gsap.to(this.loadingContainerDiv, {
      opacity: 1,
      duration: 0.05
    });
  
    // Scale the theme info div
    gsap.to(this.backgroundDiv, {
      opacity: 0,
      duration: 1,
      ease: 'power1.inOut'
    });
  }

  stopLoadingAnimation() {
    gsap.to(this.mainContainerDiv, {
      translateY: 0,
      duration: 0.05
    });
    gsap.to(this.shadowContainerDiv, {
      opacity: 1,
      duration: 0.05
    })
    gsap.to(this.loadingContainerDiv, {
      opacity: 0,
      duration: 0.5
    });
    
    // Second animation (scale the theme info div back to 1.0)
    gsap.to(this.backgroundDiv, {
      opacity: 1,
      duration: 1,
      ease: 'power1.inOut'
    });
  }

  setCalculatedGradient(downloadProgress: number) {
    gsap.to(this.downloadProgressObj, {
      current: downloadProgress,
      ease: 'power1.out', // Equivalent to 'easeOutQuad' in GSAP
      duration: 0.1, // 100ms converted to seconds (0.1s)
      onUpdate: () => {
        this.currentProgress = this.downloadProgressObj.current;
        this.calculatedGradient = `background: conic-gradient(#3b82f6 ${this.currentProgress}% 0, transparent 0%)`;
        
        if (this.currentProgress === 100) {
          setTimeout(() => {
            // console.log(this.currentProgress);
            this.stopLoadingAnimation();
          }, 250);
        }
      }
    });
  }

  ngOnDestroy() {
    // console.log("Card destroyed?");
    this.cancelThemeChange();
  }
}
