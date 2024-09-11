import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { VSExtension } from '../../types/vs-types';
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";
import { ArrowUpRightFromSquareComponent } from '../../icons/arrow-up-right-from-square/arrow-up-right-from-square.component';
import { VsThemeService } from '../../services/vs-theme.service';
import anime from 'animejs';

@Component({
  selector: 'vs-card',
  standalone: true,
  imports: [SkeletonLoaderComponent, ArrowUpRightFromSquareComponent],
  templateUrl: './vs-card.component.html'
})
export class VsCardComponent {
  @ViewChild('themeinfo') set _dm(content: ElementRef) {
    this.themeInfoDiv = content.nativeElement;
  }
  themeInfoDiv!: HTMLDivElement;
  @Input() cardInfo!: VSExtension;
  @Input() cardType: 'small' | 'large' = 'small'
  @Input() bgClass: string = 'bg-system-700';
  calculatedGradient: string = '';
  currentProgress: number = 0;
  downloadProgress: number = 0;
  downloadProgressObj = { current: 0 };

  constructor (private vs : VsThemeService) {}

  themeSelected() {
    this.itemSelected(this.cardInfo);
  }

  itemSelected(ext: VSExtension) {
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
    anime({
      targets: this.themeInfoDiv,
      scale: '0.95',
      duration: 250,
      easing: 'easeInOutQuad'
    });
  }

  stopLoadingAnimation() {
    anime({
      targets: this.themeInfoDiv,
      scale: '1.0',
      duration: 250,
      easing: 'easeInOutQuad'
    });
  }

  setCalculatedGradient(downloadProgress: number) {
    anime({
      targets: this.downloadProgressObj,
      current: downloadProgress,
      easing: 'easeOutQuad',
      duration: 100,
      update: () => {
        this.currentProgress = this.downloadProgressObj.current;
        this.calculatedGradient = `background: conic-gradient(#3b82f6 ${this.currentProgress}% 0, transparent 0%)`;
        if (this.currentProgress === 100) {
          setTimeout(() => {
            console.log(this.currentProgress);
          this.stopLoadingAnimation();
          }, 25)
        }
      }
    });
  }
}
