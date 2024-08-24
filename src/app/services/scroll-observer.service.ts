import { Injectable, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollObserverService implements OnDestroy {
  scrollObservable!: Subject<number>;

  constructor() {
    this.scrollObservable = new Subject<number>();
    window.addEventListener('scroll', this.onWindowScroll);
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  private onWindowScroll = () => {
    this.scrollObservable.next(window.scrollY);
  }
}
