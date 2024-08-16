import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { VSExtension } from '../../types/vs-types';
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";
import { ArrowUpRightFromSquareComponent } from '../../icons/arrow-up-right-from-square/arrow-up-right-from-square.component';

@Component({
  selector: 'vs-card',
  standalone: true,
  imports: [SkeletonLoaderComponent, ArrowUpRightFromSquareComponent],
  templateUrl: './vs-card.component.html'
})
export class VsCardComponent {
  private _downloadProgress?: number;
  @Input() set downloadProgress(value: number | undefined) {
    this._downloadProgress = value;
    this.setCalculatedGradient();
  }
  @Input() cardInfo!: VSExtension;
  @Input() cardType: 'small' | 'large' = 'small'
  @Input() bgClass: string = 'bg-[#262628]';
  @Output() selected: EventEmitter<any> = new EventEmitter();
  calculatedGradient: string = ''

  themeSelected() {
    this.selected.emit();
  }

  setCalculatedGradient() {
    if (!this._downloadProgress)
      return;

    this.calculatedGradient = `background: conic-gradient(blue ${ this._downloadProgress * 100 }% 0, transparent ${ (1 - this._downloadProgress) * 100 }%)`;
  }
}
