import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VsSearchComponent } from '../../components/vs-search/vs-search.component';
import { MarkdownEditorComponent } from '../../components/markdown-editor/markdown-editor.component';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { MdNode } from '../../classes/markdownparser';
import { MarkdownRendererComponent } from '../../components/markdown-renderer/markdown-renderer.component';
import { CarouselItemComponent } from '../../components/carousel-item/carousel-item.component';
import { SkeletonLoaderComponent } from '../../components/skeleton-loader/skeleton-loader.component';
import { ThemesComponent } from '../../sections/themes/themes.component';
import { ProjectsComponent } from '../../sections/projects/projects.component';
import { DrawerComponent } from '../../components/drawer/drawer.component';
import { VsMenuComponent } from "../../components/vs-menu/vs-menu.component";
import { TopBarComponent } from '../../components/top-bar/top-bar.component';

@Component({
    selector: 'home-page',
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
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  markdown?: MdNode;

  constructor() {}

  markdownChanged(newMd: MdNode) {
    this.markdown = newMd;
  }
}
