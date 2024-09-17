import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { WINDOW } from '../classes/windowinjection';

export interface WindowSize {
  x: number
  y: number
}

@Injectable({
  providedIn: 'root'
})
export class WindowObserverService implements OnDestroy {
  scrollObservable!: Subject<number>;
  sizeObservable!: Subject<WindowSize>;
  mouseUpObservable!: Subject<void>;
  mousePositionObservable!: Subject<MouseEvent | TouchEvent>;
  private wnd = inject(WINDOW);

  /**
   * Tracks window events and forwards them to subscribers.
   * `mouseUpObservable`, `mousePositionObservable`, `scrollObservable`, and `sizeObservable` are provided by this service.
   */
  constructor() {
    this.scrollObservable = new Subject();
    this.sizeObservable = new Subject();
    this.mouseUpObservable = new Subject();
    this.mousePositionObservable = new Subject();

    this.wnd.addEventListener('mousemove', (event: MouseEvent | TouchEvent) => this.mousePositionObservable.next(event));
    this.wnd.addEventListener('touchmove', (event: MouseEvent | TouchEvent) => this.mousePositionObservable.next(event));
    this.wnd.addEventListener('touchend', () => this.mouseUpObservable.next());
    this.wnd.addEventListener('mouseup', () => this.mouseUpObservable.next());

    this.wnd.addEventListener('resize', this.onWindowResize);
    this.wnd.addEventListener('scroll', this.onWindowScroll);
  }
  
  ngOnDestroy(): void {
    this.wnd.removeEventListener('resize', this.onWindowResize);
    this.wnd.removeEventListener('scroll', this.onWindowScroll);
  }

  /**
   * Scroll event handler that emits the current scroll position (Y-coordinate)
   * to the `scrollObservable` subject.
   */
  private onWindowScroll = () => {
    this.scrollObservable.next(this.wnd.scrollY); // Used an anon function here, else 'this' doesn't work
  }

  /**
   * Resize event handler that calculates the current window size and emits it
   * to the `sizeObservable` subject if the body's overflow style is not set to 'hidden'.
   */
  private onWindowResize = () => {
    const windowSize = this.getWindowSize();

    if (document.body.style.overflow !== 'hidden') {
      this.sizeObservable.next(windowSize);
    }
  }

  /**
   * Returns the current size of the this.wnd.
   * 
   * @returns An object containing the width (`x`) and height (`y`) of the this.wnd.
   */
  getWindowSize() : WindowSize {
    return {
      x: this.wnd.innerWidth,
      y: this.wnd.innerHeight
    }
  }

  /**
   * Determines if the current device is a touch-enabled device.
   * 
   * @returns `true` if the device supports touch events; otherwise, `false`.
   */
  isTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }
}
