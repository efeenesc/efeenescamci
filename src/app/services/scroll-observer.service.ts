import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

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

  constructor() {
    this.scrollObservable = new Subject();
    this.sizeObservable = new Subject();

    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('scroll', this.onWindowScroll);
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  // Use arrow functions here else "this" doesn't work
  private onWindowScroll = () => {
    this.scrollObservable.next(window.scrollY);
  }

  private onWindowResize = () => {
    const windowSize = this.getWindowSize()
    this.sizeObservable.next(windowSize);
  }

  getWindowSize() : WindowSize {
    return {
      x: window.innerWidth,
      y: window.innerHeight
    }
  }
}
