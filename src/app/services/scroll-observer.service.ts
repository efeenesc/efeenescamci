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
  private wnd = inject(WINDOW);

  constructor() {
    this.scrollObservable = new Subject();
    this.sizeObservable = new Subject();

    this.wnd.addEventListener('resize', this.onWindowResize);
    this.wnd.addEventListener('scroll', this.onWindowScroll);
  }
  
  ngOnDestroy(): void {
    this.wnd.removeEventListener('resize', this.onWindowResize);
    this.wnd.removeEventListener('scroll', this.onWindowScroll);
  }

  // Use arrow functions here else "this" doesn't work
  private onWindowScroll = () => {
    this.scrollObservable.next(this.wnd.scrollY);
  }

  private onWindowResize = () => {
    const windowSize = this.getWindowSize()
    this.sizeObservable.next(windowSize);
  }

  getWindowSize() : WindowSize {
    return {
      x: this.wnd.innerWidth,
      y: this.wnd.innerHeight
    }
  }
}
