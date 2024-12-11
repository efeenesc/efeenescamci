import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { VSExtension } from '../../types/vs-types';
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";
import { ArrowUpRightFromSquareComponent } from '../../icons/arrow-up-right-from-square/arrow-up-right-from-square.component';
import { VsThemeService } from '../../services/vs-theme.service';
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
export class VsCardComponent {
  @ViewChild('themeinfo') set _dm(content: ElementRef) {
    this.themeInfoDiv = content.nativeElement;
  }
  themeInfoDiv!: HTMLDivElement;

  @ViewChild('loadingcontainer') set _lc(content: ElementRef) {
    this.loadingContainerDiv = content.nativeElement;
  }
  loadingContainerDiv!: HTMLDivElement;

  @Input() cardInfo!: VSExtension;
  @Input() cardType: 'small' | 'large' = 'large'
  @Input('cardStyle') set _style(content: VsCardStyle) {
    this.bg900 = content.bg900;
    this.bg300 = content.bg300;
    this.fgText = content.fgText;
    this.fgAccent = content.fgAccent;
  }

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
      this.vs.setDefaultColorScheme();
      this.vs.setThemeInternal({
        themeId: "00000000-0000-0000-0000-00000000",
        themeName: this.cardInfo.displayName,
        themeAuthor: this.cardInfo.publisher.displayName,
        themeIcon: this.cardInfo.extensionIcon as string
      }, 'Beige Light');
      return;
    }
    this.itemSelected(this.cardInfo);
  }

  itemSelected(ext: VSExtension) {
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

  startLoadingAnimation() {
    // Fade in the loading container
    gsap.to(this.loadingContainerDiv, {
      opacity: 1,
      duration: 0.05
    });
  
    // Scale the theme info div
    gsap.to(this.themeInfoDiv, {
      scale: 0.95,
      duration: 0.25,
      ease: 'power1.inOut'
    });
  }

  stopLoadingAnimation() {
    gsap.to(this.loadingContainerDiv, {
      opacity: 0,
      duration: 0.05
    });
    
    // Second animation (scale the theme info div back to 1.0)
    gsap.to(this.themeInfoDiv, {
      scale: 1,
      duration: 0.25,
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
            console.log(this.currentProgress);
            this.stopLoadingAnimation();
          }, 25);
        }
      }
    });
  }  
}
