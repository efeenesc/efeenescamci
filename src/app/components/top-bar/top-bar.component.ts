import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { VsSearchComponent } from '../vs-search/vs-search.component';
import { WindowObserverService, WindowSize } from '../../services/window-observer.service';
import { MagnifyingGlassComponent } from "../../icons/magnifying-glass/magnifying-glass.component";
import { SiteLogoComponent } from "../../icons/site-logo/site-logo.component";
import { HamburgerMenuComponent } from "../../icons/menu/hamburger-menu.component";
import { RouterLink } from '@angular/router';
import gsap from 'gsap';

@Component({
    selector: 'top-bar',
    imports: [VsSearchComponent, MagnifyingGlassComponent, SiteLogoComponent, HamburgerMenuComponent, RouterLink],
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
  private topBarTween!: gsap.core.Tween;
  private hamburgerTween!: gsap.core.Tween;

  constructor(private woSvc: WindowObserverService) { }

  ngOnInit() {
    this.woSvc.scrollObservable.subscribe((newYval) => this.trackScroll(newYval));
    this.woSvc.sizeObservable.subscribe((newWndSize) => this.setTopBarMode(newWndSize));
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

    this.topBarTween = gsap.to('#topbar', {
      height: newHeight,
      ease: 'spring(1, 0.8, 10, 50)' // Using GSAP's spring easing with similar parameters
    });

    const basePadY = 0.25;
    const extraPadY = progress * 0.50;

    const finalPadY = basePadY + extraPadY + 'rem';

    if (this.hamburgerTween)
      this.hamburgerTween.kill();

    this.hamburgerTween = gsap.to('#hamburger-menu', {
      paddingTop: finalPadY,
      paddingBottom: finalPadY,
      duration: 0.05,
      ease: 'none'
    });
  }
}
