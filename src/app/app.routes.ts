import { Routes } from '@angular/router';
import { HomePageComponent } from './routes/home-page/home-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    pathMatch: 'full'
  },
  {
    path: 'blog',
    loadChildren: () => import('./routes/blog-page/blog-page-routing.module').then(m => m.BlogPageRoutingModule)
  }
];
