import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { VsSearchComponent } from '../vs-search/vs-search.component';
import { WindowObserverService, WindowSize } from '../../services/window-observer.service';
import { SiteLogoComponent } from "../../icons/site-logo/site-logo.component";
import { OverflowDirective } from '../../directives/overflow.directive';
import gsap from 'gsap';

@Component({
    selector: 'top-bar',
    imports: [VsSearchComponent, SiteLogoComponent, OverflowDirective],
    templateUrl: './top-bar.component.html',
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
  private topBarTween!: gsap.core.Tween;

  constructor(private woSvc: WindowObserverService) { }

  ngOnInit() {
    this.woSvc.scrollObservable.subscribe((newYval) => this.trackScroll(newYval));
    this.woSvc.sizeObservable.subscribe((newWndSize) => this.setTopBarMode(newWndSize));

    this.setTopBarMode(this.woSvc.getWindowSize());
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

    if (this.topBarTween)
      this.topBarTween.kill();

    this.topBarTween = gsap.to(['#topbar', '#website-logo-svg'], {
      height: newHeight,
      ease: 'elastic.out(1.2, 1)'
    });
  }
}
