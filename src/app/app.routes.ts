import { Routes } from '@angular/router';
import { BlogPostResolver } from './services/backend-resolver.service';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routes/home-page/home-page.component').then(m => m.HomePageComponent),
    pathMatch: 'full',
    data: { animation: 'home' }
  },
  {
    path: 'blog',
    loadComponent: () => import('./routes/blog-page/blog-page.component').then(m => m.BlogPageComponent),
  },
  {
    path: 'blog/:route',
    loadComponent: () => import('./routes/view-blog-page/view-blog-page.component').then(m => m.ViewBlogPageComponent),
    resolve: {
      blogPost: BlogPostResolver
    },
    data: { animation: 'blog' }
  },
  {
    path: "**",
    redirectTo: "404"
  },
  {
    path: '404',
    loadComponent: () => import('./routes/error-page/error-page.component').then(m => m.ErrorPageComponent),
  }
];
