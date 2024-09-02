import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
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
  downloadProgress: number = 0;

  constructor (private vs : VsThemeService) {}

  themeSelected() {
    this.itemSelected(this.cardInfo);
  }

  itemSelected(ext: VSExtension) {
    this.vs.changeTheme(ext, (loaded, total) => {
      
      const progress = loaded / total;
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

  setCalculatedGradient(downloadProgress: number) {
    anime({
      targets: { progress: 0 },
      progress: downloadProgress,
      easing: 'easeOutQuad',
      duration: 100,
      update: (anim) => {
        const currentProgress = Number(anim.animations[0].currentValue); // Get the animated value
        console.log(currentProgress);
        this.calculatedGradient = `background: conic-gradient(#3b82f6 ${currentProgress * 100}% 0, transparent ${(1 - currentProgress) * 100}%)`;
      }
    });
  }
}
