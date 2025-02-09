import { Component } from '@angular/core';
import { BackendService } from '../../../../services/backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'blog-section',
  imports: [],
  templateUrl: './blog.component.html',
  styles: `
  :host {
    display: flex;
    width: 100%;
  }
  `,
})
export class BlogSectionComponent {
  blogs: BlogRoute[] = [];
  errorMessage?: string;

  constructor(private backend: BackendService, private router: Router) {}

  ngOnInit() {
    this.backend.getNewBlogPostBriefs().subscribe({
      next: (data: BlogQueryResult) => {
        this.blogs = data.briefs;
      },
      error: (error: any) => {
        this.errorMessage = 'Error fetching new blog post briefs';
        console.error(error);
      }
    });
  }

  blogCardClicked(ev: MouseEvent, blog: BlogRoute) {
    this.router.navigateByUrl('/blog/' + blog.route);
  }
}
