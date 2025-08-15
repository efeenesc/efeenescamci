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
import { MarkdownRendererHtmlComponent } from '@components/markdown-renderer-html/markdown-renderer-html.component';
import { SkeletonLoaderComponent } from '@components/skeleton-loader/skeleton-loader.component';
import { Meta } from '@angular/platform-browser';
import gsap from 'gsap';

@Component({
	selector: 'view-blog-page',
	standalone: true,
	imports: [
		MarkdownEditorComponent,
		MarkdownRendererHtmlComponent,
		SkeletonLoaderComponent,
	],
	templateUrl: './view-blog-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styles: `
		.test > h3:first-of-type {
			margin-top: 0px;
		}
	`,
})
export class ViewBlogPageComponent {
	@ViewChild(MarkdownEditorComponent) set content(
		content: MarkdownEditorComponent,
	) {
		this.mdEditor = content;
		if (this.markdownText()) {
			this.mdEditor.inputText(this.markdownText());
		}
	}

	@ViewChild(MarkdownEditorComponent, { read: ElementRef })
	mdEditorRef!: ElementRef;
	mdEditor!: MarkdownEditorComponent;

	blogPost = signal<FullBlog | null>(null);
	markdownText = signal<string>('');
	editingEnabled = signal<boolean>(false);
	isLoading = signal<boolean>(true);
	error = signal<string | null>(null);
	markdownNode = signal<MdNode | undefined>(undefined);

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private meta: Meta,
	) {
		effect(() => {
			this.route.data.subscribe((data) => {
				const blogPost = data['blogPost'] as FullBlog | null;
				if (blogPost) {
					this.blogPost.set(blogPost);
					this.markdownText.set(blogPost.content ?? '');
					this.updateMetaTags(blogPost);
					this.isLoading.set(false);
				} else {
					this.router.navigateByUrl('/404');
				}
			});
		});

		effect(() => {
			if (this.mdEditor) {
				this.mdEditor.inputText(this.markdownText());
			}
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

	markdownChanged(newMd: MdNode) {
		this.markdownNode.set(newMd);
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
