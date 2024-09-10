import { Component, Input } from '@angular/core';
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
    this.vs.changeTheme(ext, (loaded, total) => {
      
      const progress = parseInt((loaded / total) + '');
      if (this.downloadProgress > progress)
        return;

      this.downloadProgress = progress;
      this.setCalculatedGradient(this.downloadProgress);
      if (progress === 1) {
        console.log(progress);
        setTimeout(() => {
          this.calculatedGradient = '';
        }, 250)
      }
    });
  }

  private easeOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x);
  }

  animateValue(
    startValue: number,
    endValue: number,
    duration: number,
    callback: (value: number) => void
  ) {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = this.easeOutQuad(progress);

      const currentValue = startValue + (endValue - startValue) * easedProgress;
      callback(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  setCalculatedGradient(downloadProgress: number) {
    // this.animateValue(this.currentProgress, downloadProgress, 100, (newVal) => {
    //   if (newVal < this.currentProgress) {
    //     console.log("ERROR:", newVal, this.currentProgress)
    //     return;
    //   }
    //   this.currentProgress = newVal;
    //   const percentDone = parseInt(this.currentProgress * 100 + '');
    //   const percentLeft = 1 - percentDone;
    //   this.calculatedGradient = `background: conic-gradient(#3b82f6 ${percentDone}% 0, transparent ${percentLeft}%)`;
    // });
    
    anime({
      targets: this.downloadProgressObj,
      current: downloadProgress,
      easing: 'easeOutQuad',
      duration: 100,
      update: () => {
        if (this.downloadProgressObj.current < this.currentProgress) {
          // console.log("ERROR:", this.downloadProgressObj.current, this.currentProgress)
          return;
        }
        this.currentProgress = this.downloadProgressObj.current;
        const percentDone = parseInt(this.currentProgress * 100 + '');
        const percentLeft = 0;
        this.calculatedGradient = `background: conic-gradient(#3b82f6 ${percentDone}% 0, transparent ${percentLeft}%)`;
      }
    });
  }
}
