import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VsSearchComponent } from './components/vs-search/vs-search.component';
import { MarkdownEditorComponent } from './components/markdown-editor/markdown-editor.component'
import { LocalStorageService } from './services/local-storage.service';
import { CarouselComponent } from './components/carousel/carousel.component';
import { MdNode } from './classes/markdownparser';
import { MarkdownRendererComponent } from "./components/markdown-renderer/markdown-renderer.component";
import { CarouselItemComponent } from "./components/carousel-item/carousel-item.component";
import { VsThemeService } from './services/vs-theme.service';
import { VSExtension, VSFilterBody } from './types/vs-types';
import { SkeletonLoaderComponent } from "./components/skeleton-loader/skeleton-loader.component";
import anime from 'animejs';
import { ThemesComponent } from "./sections/themes/themes.component";
import { ProjectsComponent } from "./sections/projects/projects.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VsSearchComponent, MarkdownEditorComponent, MarkdownRendererComponent, CarouselComponent, CarouselItemComponent, SkeletonLoaderComponent, ThemesComponent, ProjectsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  @ViewChild('main') set _(content: ElementRef) {
    this.main = content.nativeElement as HTMLDivElement;
  }
  main!: HTMLDivElement;

  title = 'efeenescamci';
  blendClass?: string;
  markdown?: MdNode;
  scrollPos: number = 0;
  currentThemeId?: string;

  constructor(private lss : LocalStorageService) { }

  ngAfterContentInit() {
    this.setMainHeight();
    this.checkTouchDevice();

    this.lss.valueChanges.subscribe((newVal) => {
      if (newVal.key === "theme_val") {
        const themeObj = JSON.parse(newVal.value);
        this.blendClass = themeObj["theme"] === 'dark' ? 'bg-blend-soft-light' : 'bg-blend-hard-light';
      }
    })
  }

  isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        ((navigator as any).msMaxTouchPoints > 0));
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

  animatePageScroll() {
    anime({
      targets: this.main,
      translateY: -window.scrollY,
      easing: 'easeOutExpo',
      duration: 200
    })
  }

  normalPageScroll() {
    this.main.style.transform = "translateY("+ -window.scrollY + "px)";
  }

  setMainHeight() {
    const pageHeight = document.getElementById('main')!.clientHeight;
    document.body.style.height = pageHeight + 'px';
  }

  markdownChanged(newMd: MdNode) {
    this.markdown = newMd;
  }
}
