import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VSExtension } from '../../types/vs-types';

@Component({
  selector: 'vs-card',
  standalone: true,
  imports: [],
  templateUrl: './vs-card.component.html',
  styleUrl: './vs-card.component.css'
})
export class VsCardComponent {
  @Input() cardInfo!: VSExtension;
  @Output() selected: EventEmitter<any> = new EventEmitter();

  themeSelected() {
    this.selected.emit();
  }
}
