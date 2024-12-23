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
  private static elements: Set<{ el: HTMLElement, val: number }> = new Set();
  static state: OverflowState = OverflowState.NOT_CORRECTED;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    OverflowDirective.elements.add({el: this.el.nativeElement, val: this.padBy});
  }

  ngOnDestroy(): void {
    OverflowDirective.elements.delete({el: this.el.nativeElement, val: this.padBy});
  }

  static getAllElements(): { el: HTMLElement, val: number }[] {
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
    OverflowDirective.getAllElements().forEach(({ el, val }) => {
      el.dataset['originalPaddingRight'] = el.style.paddingRight;
      el.style.paddingRight = el.style.paddingRight + val + 'px';
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
    OverflowDirective.getAllElements().forEach(({ el }) => {
      el.style.paddingRight = el.dataset['originalPaddingRight']!;
    })
  }
}
