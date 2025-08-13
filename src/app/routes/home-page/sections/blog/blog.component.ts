import { Component, OnInit, signal } from '@angular/core';
import { BackendService } from '../../../../services/backend.service';
import { Router } from '@angular/router';
import { SkeletonLoaderComponent } from '../../../../components/skeleton-loader/skeleton-loader.component';

@Component({
	selector: 'blog-section',
	imports: [SkeletonLoaderComponent],
	templateUrl: './blog.component.html',
	styles: `
		:host {
			display: flex;
			width: 100%;
			flex-basis: 100%;
		}
	`,
})
export class BlogSectionComponent implements OnInit {
	blogs = signal<BlogRoute[]>([]);
	errorMessage?: string;

	constructor(
		private backend: BackendService,
		private router: Router,
	) {}

	ngOnInit() {
		this.backend.getNewBlogPostBriefs().subscribe({
			next: (data: BlogQueryResult) => {
				this.blogs.set(data.briefs);
			},
			error: (error: unknown) => {
				this.errorMessage = 'Error fetching new blog post briefs';
				console.error(error);
			},
		});
	}

	blogCardClicked(blog: BlogRoute) {
		this.router.navigateByUrl('/blog/' + blog.route);
	}

	keyPressed(event: KeyboardEvent, blog: BlogRoute) {
		if (event.key === 'Enter') this.blogCardClicked(blog);
	}
}
