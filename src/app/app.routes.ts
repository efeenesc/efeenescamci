import { Routes } from '@angular/router';
import { HomePageComponent } from './routes/home-page/home-page.component';
import { BlogPageComponent } from './routes/blog-page/blog-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    pathMatch: 'full'
  },
  {
    path: 'blog',
    component: BlogPageComponent,
  }
];
