import { Component } from '@angular/core';

@Component({
    selector: 'carousel-item',
    imports: [],
    template: `
    <div
      class="h-full overflow-hidden aspect-square shadow-lg-alt rounded-2xl flex items-center justify-center"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class CarouselItemComponent {}
