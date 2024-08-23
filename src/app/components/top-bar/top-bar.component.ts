import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VsSearchComponent } from '../vs-search/vs-search.component';

@Component({
  selector: 'top-bar',
  standalone: true,
  imports: [VsSearchComponent],
  templateUrl: './top-bar.component.html'
})
export class TopBarComponent {
  @Input()
  themeBarStyle?: string; 

  @Output()
  themeButtonClicked: EventEmitter<boolean> = new EventEmitter();

  emitThemeBarClickedEvent() {
    this.themeButtonClicked.emit();
  }
}
