import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VsSearchComponent } from './components/vs-search/vs-search.component';
import { MarkdownEditorComponent } from './components/markdown-editor/markdown-editor.component';
import { LocalStorageService } from './services/local-storage.service';
import { CarouselComponent } from './components/carousel/carousel.component';
import { MdNode } from './classes/markdownparser';
import { MarkdownRendererComponent } from './components/markdown-renderer/markdown-renderer.component';
import { CarouselItemComponent } from './components/carousel-item/carousel-item.component';
import { VsThemeService } from './services/vs-theme.service';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { ThemesComponent } from './sections/themes/themes.component';
import { ProjectsComponent } from './sections/projects/projects.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { VsMenuComponent } from './components/vs-menu/vs-menu.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { WindowObserverService } from './services/window-observer.service';
import { gsap } from "gsap";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    VsSearchComponent,
    MarkdownEditorComponent,
    MarkdownRendererComponent,
    CarouselComponent,
    CarouselItemComponent,
    SkeletonLoaderComponent,
    ThemesComponent,
    ProjectsComponent,
    DrawerComponent,
    VsMenuComponent,
    TopBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
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
  scrollPos: number = 0;
  elTranslatePos: { current: number } = { current: 0 };
  themeBarStyle: string = '';
  drawerOpened: boolean = false;
  mainResizeObserver: ResizeObserver = new ResizeObserver((entries) => this.onMainResized(entries));
  private pageScrollTween?: gsap.core.Tween;

  constructor(private lss: LocalStorageService, private vsSvc: VsThemeService, private woSvc: WindowObserverService) {}

  ngOnInit() {
    // Reset to default theme if the current theme is default theme
    // This is to make sure any changes to the default theme are reflected on-device
    const resetToDefaultTheme = this.checkIfDefaultThemeEnabled();
    this.restoreLastTheme(resetToDefaultTheme)

    this.checkTouchDevice();
  }

  ngAfterContentInit() {
    this.mainResizeObserver.observe(document.getElementById('main')!)

    this.setMainHeight();

    this.woSvc.sizeObservable.subscribe(() => {
      this.setMainHeight();
    })

    this.lss.valueChanges.subscribe((newVal) => {
      if (newVal.key === 'theme_val') {
        const themeObj = JSON.parse(newVal.value);
        this.blendClass =
          themeObj['theme'] === 'dark'
            ? 'bg-blend-soft-light'
            : 'bg-blend-hard-light';
      }
    });
  }

  onMainResized(entries: ResizeObserverEntry[]) {
    const main = entries.find((e) => e.target.id === 'main');
    if (!main) return;

    const rect = main.contentRect;
    document.body.style.height = rect.height + 'px';
  }

  checkIfDefaultThemeEnabled(): boolean {
    const themeName = this.lss.get('theme_name');
    const themeAuthor = this.lss.get('theme_author');

    return themeName === 'Beige' && themeAuthor === 'efeenesc';
  }

  restoreLastTheme(resetToDefault: boolean = false) {
    const cs = this.vsSvc.getFromLocalStorage();

    if (!cs || resetToDefault || Object.keys(cs).includes('darkest')) {
      return this.vsSvc.setDefaultColorScheme();
    }

    this.vsSvc.changeColorVariables(cs);
  }

  checkTouchDevice() {
    if (!this.woSvc.isTouchDevice()) {
      this.woSvc.scrollObservable.subscribe((newYval) => {
        this.animatePageScroll(newYval);
      });
    } else {
      this.woSvc.scrollObservable.subscribe((newYval) => {
        this.normalPageScroll(newYval);
      });
    }
  }

  drawerClosed() {
    this.drawerOpened = false;
  }

  themeButtonClicked() {
    this.drawerOpened = true;
  }

  animatePageScroll(scrollY: number) {
    if (this.pageScrollTween) {
      this.pageScrollTween.kill();
    }
  
    this.pageScrollTween = gsap.to(this.elTranslatePos, {
      current: -scrollY,
      duration: 0.2,
      ease: "power4.out",
      onUpdate: () => {
        const newPos = `translateY(${this.elTranslatePos.current}px)`;
        gsap.set(this.main, {
          transform: newPos,
          webkitTransform: newPos
        });
      }
    });
  }

  normalPageScroll(scrollY: number) {
    this.main.style.transform = 'translateY(' + -scrollY + 'px)';
    this.main.style.webkitTransform = 'translateY(' + -scrollY + 'px)';
  }

  setMainHeight() {
    const pageHeight = document.getElementById('main')!.clientHeight;
    document.body.style.height = pageHeight + 'px';
  }

  markdownChanged(newMd: MdNode) {
    this.markdown = newMd;
  }
}
