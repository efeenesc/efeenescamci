import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BackendService } from '@services/backend.service';
import { Router } from '@angular/router';

interface Page {
	pageNumber: number;
	limit: number;
	skip: number;
	current: boolean;
}

@Component({
	selector: 'blog-page',
	imports: [],
	templateUrl: './blog-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPageComponent {
	limit = 10;
	skip = 0;
	pages?: Page[];

	private _total?: number;
	get total(): number | undefined {
		return this._total;
	}
	set total(v: number) {
		this._total = v;
		this.pages = this.calculateNumberOfPages(v, this.limit);
	}

	blogs: BlogRoute[] = [];
	errorMessage: string | null = null;

	constructor(
		private backend: BackendService,
		private router: Router,
	) {
		this.getPosts();
	}

	blogCardClicked(blog: BlogRoute) {
		this.router.navigateByUrl('/blog/' + blog.route);
	}

	getPosts() {
		this.backend.getLimitedNumberOfPosts(this.limit, this.skip).subscribe({
			next: (data: BlogQueryResult) => {
				if (this.total !== data.total) this.total = data.total;

				this.blogs = data.briefs;
			},
			error: (error: unknown) => {
				this.errorMessage = 'Error fetching new blog post briefs';
				console.error(error);
			},
		});
	}

	private calculateNumberOfPages(total: number, pageSize: number): Page[] {
		const totalNumberOfPages = Math.ceil(total / pageSize);
		const currentPage = Math.floor(this.skip / pageSize);
		const allPages: Page[] = [];

		for (let i = 0; i < totalNumberOfPages; i++) {
			allPages.push({
				pageNumber: i,
				limit: this.limit,
				skip: pageSize * i,
				current: currentPage === i,
			});
		}

		return allPages;
	}

	pageNumberClicked(page: Page) {
		const currentPageIdx = this.pages!.findIndex((p) => p.current);
		this.limit = page.limit;
		this.skip = page.skip;

		this.getPosts();
		this.pages![currentPageIdx].current = false;
		this.pages![page.pageNumber].current = true;
	}
}
