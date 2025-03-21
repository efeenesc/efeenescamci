import {
  Component,
  ElementRef,
  signal,
  ViewChild,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocalStorageService } from './services/local-storage.service';
import { MdNode } from './classes/markdown/index.interface';
import { VsThemeService } from './services/vs-theme.service';
import { DrawerComponent } from './components/drawer/drawer.component';
import { VsMenuComponent } from './components/vs-menu/vs-menu.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { OverflowDirective } from './directives/overflow.directive';
import { FooterComponent } from './components/footer/footer.component';
import beigeIcon from './icons/beige-theme-icon/beigeiconb64';
import {
  FakeLoadingBarService,
  LoadingState,
} from './services/fake-loading-bar.service';
import gsap from 'gsap';
import { FakeLoadingBarComponent } from "./components/fake-loading-bar/fake-loading-bar.component";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    DrawerComponent,
    VsMenuComponent,
    TopBarComponent,
    OverflowDirective,
    FooterComponent,
    FakeLoadingBarComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  @ViewChild('main') set _m(content: ElementRef) {
    this.main = content.nativeElement as HTMLDivElement;
  }
  main!: HTMLDivElement;

  @ViewChild('contentarea') set _ca(content: ElementRef) {
    this.contentarea = content.nativeElement as HTMLDivElement;
  }
  contentarea!: HTMLDivElement;

  title = 'efeenescamci';
  blendClass?: string;
  markdown?: MdNode;
  scrollPos = 0;
  elTranslatePos: { current: number } = { current: 0 };
  themeBarStyle = '';
  drawerOpened = signal<boolean>(false);
  showUI = signal<boolean>(false);
  showPageTween?: gsap.core.Tween;

  constructor(
    private lss: LocalStorageService,
    private vsSvc: VsThemeService,
    private fakeLoadingBarSvc: FakeLoadingBarService
  ) {
    this.restoreLastTheme();
    fakeLoadingBarSvc.state.subscribe((state) => {
      if (state === LoadingState.STARTED) {
        this.hidePage();
      } else {
        setTimeout(() => {
          this.showPage();
        }, 100);
      }
    });
  }

  hidePage() {
    if (this.main) {
      if (this.showPageTween) {
        this.showPageTween.kill();
        this.showPageTween = undefined;
      }

      this.main.style.opacity = '0';
    }
  }

  showPage() {
    if (this.showPageTween) {
      this.showPageTween.kill();
      this.showPageTween = undefined;
    }

    this.showPageTween = gsap.to(this.main, {
      opacity: 1,
      duration: 0.5,
    });
  }

  ngOnInit() {
    console.log(
      `█████████████████████████████████████
████████████             ████████████
████████    █████████████    ████████
██████   ████           ████   ██████
█████  ███                 ███  █████
███   ██        █████        ██   ███
██   ██      ████████████     ██   ██
██  ██     ███████████████     ██  ██
█  ██     █████████████████     ██  █
█  ██                           ██  █
█  ██                           ██  █
█  ██     ████████████████████████  █
██  ██     ███████████████    ███  ██
██   ██      ███████████      ██   ██
███   ██         ███         ██   ███
█████  ████               ████  █████
██████   █████         █████   ██████
████████    █████████████    ████████
████████████              ███████████
█████████████████████████████████████
`
    );
  }

  drawerClosed() {
    this.drawerOpened.set(false);
  }

  themeButtonClicked() {
    this.drawerOpened.set(true);
  }

  routerActivated() {
    this.showUI.set(true);
  }

  onMainResized(entries: ResizeObserverEntry[]) {
    const main = entries.find((e) => e.target.id === 'main');
    if (!main) return;

    const rect = main.contentRect;
    document.body.style.height = rect.height + 'px';
  }

  /**
   * Checks if the default theme is enabled by comparing the theme name and author with the default values.
   *
   * @returns {boolean} True if the default theme is enabled, false otherwise.
   */
  checkIfDefaultThemeEnabled(): boolean {
    // Get the theme name and author from local storage
    const themeName = this.lss.get('theme_name');
    const themeAuthor = this.lss.get('theme_author');

    // Compare the theme name and author with the default values
    return themeName === 'Beige' && themeAuthor === 'efeenesc';
  }

  /**
   * Restores the last theme from local storage.
   * If the theme is invalid or resetToDefault is true, it sets the default color scheme.
   *
   * @param resetToDefault Whether to reset to the default theme. Defaults to false.
   */
  restoreLastTheme(resetToDefault = false) {
    // Get the color scheme from local storage
    const cs = this.vsSvc.getFromLocalStorage();

    // Check if the color scheme is invalid or if we need to reset to default
    if (!cs || resetToDefault || Object.keys(cs).includes('darkest')) {
      // Set the default color scheme if the conditions are met
      return this.vsSvc.setDefaultColorScheme('default', beigeIcon);
    }

    this.vsSvc.activeThemeVariantName.next(cs!.name);

    // Change the color variables to the restored color scheme
    this.vsSvc.changeColorVariables(cs);
  }

  /**
   * Checks if the device is a touch device and subscribes to the scroll observable accordingly.
   * If it's not a touch device, it animates the page scroll. Otherwise, it performs a normal page scroll.
   */
  // checkTouchDevice() {
  //   // Check if the device is a touch device
  //   if (!this.woSvc.isTouchDevice()) {
  //     // Subscribe to the scroll observable and animate the page scroll on non-touch devices
  //     this.woSvc.scrollObservable.subscribe((newYval) => {
  //       this.animatePageScroll(newYval);
  //     });
  //   } else {
  //     // Subscribe to the scroll observable and perform a normal page scroll on touch devices
  //     this.woSvc.scrollObservable.subscribe((newYval) => {
  //       this.normalPageScroll(newYval);
  //     });
  //   }
  // }

  /**
   * Animates the page scroll by updating the transform property of the main element.
   *
   * @param scrollY The current scroll Y position.
   */
  // animatePageScroll(scrollY: number) {
  //   // Check if a tween is already in progress and kill it if necessary.
  //   if (this.pageScrollTween) {
  //     this.pageScrollTween.kill();
  //   }

  //   // Create a new tween to animate the page scroll.
  //   this.pageScrollTween = gsap.to(this.elTranslatePos, {
  //     // Set the current position to the negative of the scroll Y position.
  //     current: -scrollY,
  //     // Set the animation duration to 0.2 seconds.
  //     duration: 0.2,
  //     // Use the power4.out easing function for a smooth animation.
  //     ease: 'power4.out',
  //     // Update the transform property of the main element on each frame.
  //     onUpdate: () => {
  //       // Calculate the new transform position.
  //       const newPos = `translateY(${this.elTranslatePos.current}px)`;
  //       // Set the transform property of the main element.
  //       gsap.set(this.main, {
  //         transform: newPos,
  //         webkitTransform: newPos,
  //       });
  //     },
  //   });
  // }

  // normalPageScroll(scrollY: number) {
  //   this.main.style.transform = 'translateY(' + -scrollY + 'px)';
  //   this.main.style.webkitTransform = 'translateY(' + -scrollY + 'px)';
  // }

  // setMainHeight() {
  //   const pageHeight = document.getElementById('main')!.clientHeight;
  //   document.body.style.height = pageHeight + 'px';
  // }
}
