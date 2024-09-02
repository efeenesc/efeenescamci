import { Directive, ElementRef, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[defer]',
  standalone: true
})
export class DeferLoadDirective implements AfterViewInit, OnDestroy {
  @Output() deferLoad = new EventEmitter<void>();

  private intersectionObserver?: IntersectionObserver;

  constructor(private element: ElementRef) {}

  ngAfterViewInit(): void {
    this.intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.deferLoad.emit();
        this.intersectionObserver?.disconnect();
      }
    });
    this.intersectionObserver.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }
}