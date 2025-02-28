import { Component } from '@angular/core';
import { ThemesComponent } from './sections/themes/themes.component';
import { ExperimentsComponent } from './sections/experiments/experiments.component';
import { BlogSectionComponent } from './sections/blog/blog.component';

@Component({
  selector: 'home-page',
  imports: [
    ThemesComponent,
    ExperimentsComponent,
    BlogSectionComponent,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {

}
