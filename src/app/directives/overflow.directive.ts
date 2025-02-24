import { Directive, ElementRef, Input } from '@angular/core';

enum OverflowState {
  NOT_CORRECTED,
  CORRECTED
}
@Directive({
  selector: '[correct-overflow]'
})
export class OverflowDirective {
  @Input('pad-by') padBy: number = 10;
  @Input('use-transform') useTransform: boolean = false;
  private static elements: Set<{ el: HTMLElement, val: number, useTransform: boolean }> = new Set();
  static state: OverflowState = OverflowState.NOT_CORRECTED;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    OverflowDirective.elements.add({el: this.el.nativeElement, val: this.padBy, useTransform: this.useTransform });
  }

  ngOnDestroy(): void {
    OverflowDirective.elements.delete({el: this.el.nativeElement, val: this.padBy, useTransform: this.useTransform});
  }

  static getAllElements(): { el: HTMLElement, val: number, useTransform: boolean }[] {
    return Array.from(OverflowDirective.elements);
  }

  /** 
   * Corrects document overflow being set to 'hidden' by getting registered fixed pos. elements'
   * padding-right before setting it to the value specified in 'padBy'.
   * This is to prevent the element from shifting when the overflow is set to 'hidden'.
   * 
   * Call this right before setting overflow to 'hidden'. 
   * 
   * Call `postOverflowHidden` after setting overflow to its initial, non-hidden value. 
   */
  static preOverflowHidden() {
    if (window.innerWidth - document.body.clientWidth === 0) return;
    OverflowDirective.getAllElements().forEach(({ el, val, useTransform }) => {
      let origPad;
      let newPad;

      if (useTransform) {
        origPad = el.style.transform;
        newPad = `translateX(${val}px)`;
        el.style.transform = newPad;
      } else {
        origPad = el.style.paddingRight;
        newPad = el.style.paddingRight + val + 'px';
        el.style.paddingRight = newPad;
      }
      
      el.dataset['originalPad'] = origPad;
    })
  }

  /**
   * Resets the padding-right style of all registered fixed pos. elements.
   * 
   * Call this right after setting overflow to its initial, non-hidden value.
   * 
   * Call `preOverflowHidden` before setting overflow to 'hidden'.
   */
  static postOverflowHidden() {
    if (window.innerWidth - document.body.clientWidth === 0) return;

    OverflowDirective.getAllElements().forEach(({ el, useTransform }) => {
      if (useTransform) {
        el.style.transform = el.dataset['originalPad']!;
      } else {
        el.style.paddingRight = el.dataset['originalPad']!;
      }
    })
  }
}
