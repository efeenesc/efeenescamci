import {
	Component,
	ElementRef,
	ViewChild,
	signal,
	effect,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkdownEditorComponent } from '@components/markdown-editor/markdown-editor.component';
import { MdNode } from '@classes/markdown';
import { MarkdownRendererComponent } from '@components/markdown-renderer/markdown-renderer.component';
import { SkeletonLoaderComponent } from '@components/skeleton-loader/skeleton-loader.component';
import { Meta } from '@angular/platform-browser';
import gsap from 'gsap';
import { HeadingDirective } from '@directives/heading.directive';
import { PortalContentDirective } from '@directives/portal.directive';
import { FakeLoadingBarService } from '@services/fake-loading-bar.service';

@Component({
	selector: 'view-blog-page',
	standalone: true,
	imports: [
		MarkdownRendererComponent,
		SkeletonLoaderComponent,
		HeadingDirective,
		PortalContentDirective,
	],
	templateUrl: './view-blog-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewBlogPageComponent {
	@ViewChild(MarkdownEditorComponent, { read: ElementRef })
	mdEditorRef!: ElementRef;
	mdEditor!: MarkdownEditorComponent;

	blogPost = signal<FullBlog | null>(null);
	markdownText = signal<string>('');
	editingEnabled = signal<boolean>(false);
	isLoading = signal<boolean>(true);
	error = signal<string | null>(null);
	markdownNode = signal<MdNode | undefined>(undefined);
	worker: Worker | null = null;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private meta: Meta,
		private loadbarSvc: FakeLoadingBarService,
	) {
		loadbarSvc.setStrategy('custom');
		if (typeof Worker !== 'undefined') {
			this.worker = new Worker(
				new URL('../../workers/markdown-runner.worker.ts', import.meta.url),
			);
			this.worker.onmessage = ({ data }) => {
				this.markdownNode.set(data);
			};
			this.worker.postMessage(this.markdownText());
		}

		effect(() => {
			if (this.markdownText()) {
				this.worker?.postMessage(this.markdownText());
			}
		});

		effect(() => {
			this.route.data.subscribe((data) => {
				const blogPost = data['blogPost'] as FullBlog | null;
				if (blogPost) {
					this.blogPost.set(blogPost);
					this.markdownText.set(blogPost.content ?? '');
					this.updateMetaTags(blogPost);
					this.isLoading.set(false);
					this.loadbarSvc.complete('custom');
				} else {
					this.router.navigateByUrl('/404');
				}
			});
		});
	}

	updateMetaTags(blog: FullBlog) {
		this.meta.updateTag({
			property: 'og:title',
			content: blog.title + ' - efeenescamci.com',
		});
		this.meta.updateTag({ property: 'og:url', content: this.router.url });
	}

	fillText(text: string) {
		this.markdownText.set(text);
	}

	editButtonClicked() {
		this.editingEnabled.set(!this.editingEnabled());
	}

	animateEditorAppear(visible: boolean) {
		gsap.to(this.mdEditorRef.nativeElement, {
			opacity: visible ? 1.0 : 0.0,
			duration: 0.2,
			onStart: () => {
				if (visible) this.mdEditorRef.nativeElement.style.display = 'flex';
			},
			onComplete: () => {
				if (!visible) this.mdEditorRef.nativeElement.style.display = 'none';
			},
		});
	}
}
