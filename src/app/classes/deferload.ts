import { Directive, ElementRef, EventEmitter, Output, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[defer]',
  standalone: true
})
export class DeferLoadDirective implements OnDestroy {
  @Output() deferLoad = new EventEmitter<void>();
  private platformId = inject(PLATFORM_ID);

  private intersectionObserver?: IntersectionObserver;

  constructor(private element: ElementRef) {
    if (isPlatformBrowser(this.platformId)) {
      this.intersectionObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          this.deferLoad.emit();
          this.intersectionObserver?.disconnect();
        }
      });
      this.intersectionObserver.observe(this.element.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.intersectionObserver?.disconnect();
    }
  }
}
