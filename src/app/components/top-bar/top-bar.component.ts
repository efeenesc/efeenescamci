import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { VsSearchComponent } from '../vs-search/vs-search.component';
import anime from 'animejs';
import { WindowObserverService, WindowSize } from '../../services/window-observer.service';
import { MagnifyingGlassComponent } from "../../icons/magnifying-glass/magnifying-glass.component";
import { SiteLogoComponent } from "../../icons/site-logo/site-logo.component";

@Component({
  selector: 'top-bar',
  standalone: true,
  imports: [VsSearchComponent, MagnifyingGlassComponent, SiteLogoComponent],
  templateUrl: './top-bar.component.html'
})
export class TopBarComponent {
  @ViewChild('topbar') set _tb(content: ElementRef) {
    this.topbar = content.nativeElement as HTMLDivElement;
  }
  topbar!: HTMLDivElement;

  @Input()
  themeBarStyle?: string; 

  @Output()
  themeButtonClicked: EventEmitter<boolean> = new EventEmitter();

  topbarScrollProgress!: number;
  topbarExtended: boolean = true;
  mobileMode: boolean = false;
  minScrollY: number = 0;
  maxScrollY: number = 200;

  constructor(private woSvc: WindowObserverService) {}

  ngOnInit() {
    this.woSvc.scrollObservable.subscribe((newYval) => this.trackScroll(newYval))
    this.woSvc.sizeObservable.subscribe((newWndSize) => this.setTopBarMode(newWndSize))
  }

  emitThemeBarClickedEvent() {
    this.themeButtonClicked.emit();
  }

  trackScroll(newYval: number) {
    if (newYval < this.minScrollY) {
      return;
    }
    
    if (newYval > this.maxScrollY) {
      this.topbarScrollProgress = 0;
    } else {
      this.topbarScrollProgress = 1 - (newYval / this.maxScrollY);
    }

    this.playNewTopBarAnimation(this.topbarScrollProgress);
  }

  // This relies on the window size to determine whether the user is on mobile or not.
  // If on mobile, a different top bar will be shown.
  setTopBarMode(newWndSize: WindowSize) {
    this.mobileMode = newWndSize.x < 768 ? true : false;
  }

  playNewTopBarAnimation(progress: number) {
    const baseHeight = 5; // Height in vh (viewport height)
    const extraHeight = progress * 5;

    const finalHeight = baseHeight + extraHeight;
    const newHeight = finalHeight + 'vh';

    anime({
      targets: '#topbar',
      height: newHeight,
      easing: 'spring(0, 80, 50, 10)'
    })
  }

  //! UNUSED
  playTopBarAnimation(forward: boolean) {
    this.topbarExtended = forward;
    const newHeight = forward ? '10vh' : '5vh';

    const themeBarStyle = forward ? '' : 'padding: 0; padding-right: 10px; font-size: 1em';

    this.themeBarStyle = themeBarStyle;

    anime({
      targets: '#topbar',
      height: newHeight,
      duration: 100,
      easing: 'easeInOutQuad'
    })
  }
}
