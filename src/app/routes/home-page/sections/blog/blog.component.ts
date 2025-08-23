import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	signal,
} from '@angular/core';
import { BackendService } from '@services/backend.service';
import { Router } from '@angular/router';
import {
	NormalCardComponent,
	NormalCardInfo,
} from '@components/normal-card/normal-card.component';
import { ArrowDownComponent } from '@icons/arrow-down/arrow-down.component';
import { HeadingDirective } from '@directives/heading.directive';

@Component({
	selector: 'blog-section',
	imports: [NormalCardComponent, ArrowDownComponent, HeadingDirective],
	templateUrl: './blog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: `
		:host {
			display: flex;
			width: 100%;
			flex-basis: 100%;
		}
	`,
	styleUrl: 'blog.component.css',
})
export class BlogSectionComponent implements OnInit {
	showingMore = signal<boolean>(false);
	blogs = signal<NormalCardInfo[]>([]);
	errorMessage?: string;
	showCount = 3;

	constructor(
		private backend: BackendService,
		private router: Router,
	) {}

	ngOnInit() {
		this.backend.getNewBlogPostBriefs().subscribe({
			next: (data: BlogQueryResult) => {
				this.blogs.set(
					data.briefs.map((d) => {
						return {
							id: d.id,
							name: d.title,
							desc: d.created_at,
							source_url: '/blog/' + d.route,
						};
					}),
				);
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

	toggleShowMore() {
		this.showingMore.set(!this.showingMore());
	}
}
