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
import anime from 'animejs';
import { ThemesComponent } from './sections/themes/themes.component';
import { ProjectsComponent } from './sections/projects/projects.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { VsMenuComponent } from "./components/vs-menu/vs-menu.component";
import { TopBarComponent } from './components/top-bar/top-bar.component';

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
    TopBarComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  @ViewChild('main') set _m(content: ElementRef) {
    this.main = content.nativeElement as HTMLDivElement;
  }
  main!: HTMLDivElement;

  @ViewChild('topbar') set _tb(content: ElementRef) {
    this.topbar = content.nativeElement as HTMLDivElement;
  }
  topbar!: HTMLDivElement;

  @ViewChild('contentarea') set _ca(content: ElementRef) {
    this.contentarea = content.nativeElement as HTMLDivElement;
  }
  contentarea!: HTMLDivElement;

  title = 'efeenescamci';
  blendClass?: string;
  markdown?: MdNode;
  scrollPos: number = 0;
  topbarExtended: boolean = true;
  themeBarStyle: string = '';
  drawerOpened: boolean = false;

  constructor(private lss: LocalStorageService, private vsSvc: VsThemeService) {}

  ngOnInit() {
    // Reset to default theme if the current theme is default theme
    // This is to make sure any changes to the default theme are reflected on-device
    let resetToDefaultTheme = this.checkIfDefaultThemeEnabled();
    this.restoreLastTheme(resetToDefaultTheme)

    this.checkTouchDevice();
  }

  ngAfterContentInit() {
    this.animateLogo();
    this.setMainHeight();

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

  checkIfDefaultThemeEnabled(): boolean {
    const themeName = this.lss.get('theme_name');
    const themeAuthor = this.lss.get('theme_author');

    return themeName === 'Beige' && themeAuthor === 'efeenesc';
  }

  restoreLastTheme(resetToDefault: boolean = false) {
    const cs = this.vsSvc.getFromLocalStorage();

    if (!cs || resetToDefault) {
      return this.vsSvc.setDefaultColorScheme();
    }

    this.vsSvc.changeColorVariables(cs);
  }

  isTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  checkTouchDevice() {
    if (!this.isTouchDevice()) {
      document.addEventListener('scroll', () => this.animatePageScroll());
      document.removeEventListener('scroll', () => this.normalPageScroll());
    } else {
      document.addEventListener('scroll', () => this.normalPageScroll());
      document.removeEventListener('scroll', () => this.animatePageScroll());
    }
  }

  drawerClosed() {
    this.drawerOpened = false;
  }

  themeButtonClicked() {
    this.drawerOpened = true;
  }

  animatePageScroll() {
    this.trackTopBar();
    anime({
      targets: this.main,
      translateY: -window.scrollY,
      easing: 'easeOutExpo',
      duration: 200,
    });
  }

  animateLogo() {
    const targetpath = document.getElementById('website-logo-path');

    setTimeout(() => {
      let timeline = anime.timeline();

      timeline.add({
        targets: targetpath,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInQuad',
        duration: 3000
      })

      timeline.add({
        targets: targetpath,
        fill: '#fff',
        duration: 1000,
        easing: 'easeOutQuad',
      });
    }, 50);
  }

  normalPageScroll() {
    this.trackTopBar();
    this.main.style.transform = 'translateY(' + -window.scrollY + 'px)';
  }

  trackTopBar() {
    if (window.scrollY > 50) {

      if (this.topbarExtended)
        this.playTopBarAnimation(false);

    } else {

      if (!this.topbarExtended)
        this.playTopBarAnimation(true);
      
    }
  }

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

  setMainHeight() {
    const pageHeight = document.getElementById('main')!.clientHeight;
    document.body.style.height = pageHeight + 'px';
  }

  markdownChanged(newMd: MdNode) {
    this.markdown = newMd;
  }
}
