import {
	Directive,
	Input,
	ViewContainerRef,
	Renderer2,
	OnChanges,
	OnDestroy,
	ElementRef,
} from '@angular/core';
import { MdNode } from '@classes/markdown';
import { HeadingDirective } from './heading.directive';

@Directive({
	selector: '[markdownRenderer]',
	standalone: true,
})
export class MarkdownRendererDirective implements OnChanges, OnDestroy {
	@Input('markdownRenderer') nodes: MdNode[] | null = null;

	private topLevelCreated: { node: Node; directive?: HeadingDirective }[] = [];
	private headingDirectives: HeadingDirective[] = [];

	constructor(
		private vcr: ViewContainerRef,
		private renderer: Renderer2,
	) {}

	ngOnChanges(): void {
		this.clear();
		if (!this.nodes || this.nodes.length === 0) return;

		for (const n of this.nodes) {
			this.renderTop(n);
		}
	}

	ngOnDestroy(): void {
		this.clear();
	}

	private parentNode(): Node {
		// anchor is the comment node where the structural directive sits; insert new nodes before it to preserve order
		const anchor = this.vcr.element.nativeElement as Comment;
		return anchor.parentNode as Node;
	}

	private beforeAnchorAppend(node: Node): void {
		const parent = this.parentNode();
		const anchor = this.vcr.element.nativeElement as Comment;
		this.renderer.insertBefore(parent, node, anchor);
		this.topLevelCreated.push({ node });
	}

	/**
	 * Clears the entire document. Redraw afterwards if something has changed (ngOnChanges),
	 * or don't if we're navigating away from the markdown renderer page
	 */
	private clear(): void {
		// Destroy all heading directives first
		for (const directive of this.headingDirectives) {
			directive.ngOnDestroy();
		}
		this.headingDirectives = [];

		const parent = this.parentNode();
		for (const n of this.topLevelCreated) {
			try {
				this.renderer.removeChild(parent, n.node);
			} catch {
				// Ignore errors if node was already removed
			}
		}
		this.topLevelCreated = [];
	}

	private renderTop(node: MdNode): void {
		// top-level nodes are inserted before the anchor
		switch (node.type) {
			case 'text': {
				const t = this.renderer.createText(String(node.content ?? ''));
				this.beforeAnchorAppend(t);
				break;
			}
			default: {
				const el = this.createElementFor(node);
				if (el) {
					this.beforeAnchorAppend(el);
					this.renderChildrenInto(el, node);
				}
			}
		}
	}

	private renderChildrenInto(parentEl: HTMLElement, node: MdNode): void {
		const content = node.content;
		if (!content) return;

		if (typeof content === 'string') {
			this.renderer.appendChild(parentEl, this.renderer.createText(content));
			return;
		}

		for (const child of content) {
			if (child.type === 'text') {
				this.renderer.appendChild(
					parentEl,
					this.renderer.createText(String(child.content ?? '')),
				);
			} else {
				const childEl = this.createElementFor(child);
				if (childEl) {
					this.renderer.appendChild(parentEl, childEl);
					this.renderChildrenInto(childEl, child);
				}
			}
		}
	}

	private createElementFor(node: MdNode): HTMLElement | null {
		switch (node.type) {
			// block nodes
			case 'p':
				return this.renderer.createElement('p');
			case 'ul':
				return this.renderer.createElement('ul');
			case 'ol':
				return this.renderer.createElement('ol');
			case 'li':
				return this.renderer.createElement('li');
			case 'code':
				return this.renderer.createElement('code');
			case 'bq':
				return this.renderer.createElement('blockquote');

			// headings with optional hook
			case 'h1':
				return this.createHeading(1);
			case 'h2':
				return this.createHeading(2);
			case 'h3':
				return this.createHeading(3);
			case 'h4':
				return this.createHeading(4);
			case 'h5':
				return this.createHeading(5);
			case 'h6':
				return this.createHeading(6);

			// inline formatting
			case 'b':
				return this.renderer.createElement('strong');
			case 'i':
				return this.renderer.createElement('em');
			case 'bi': {
				// <strong><em>…</em></strong>
				const strong = this.renderer.createElement('strong');
				const em = this.renderer.createElement('em');
				this.renderer.appendChild(strong, em);
				// Render children into <em> later by special path:
				// we return <strong> and temporarily stash <em> on it.
				(strong as any).__innerTarget = em as HTMLElement;
				return strong;
			}
			case 'st':
				return this.renderer.createElement('del');

			case 'br':
				return this.renderer.createElement('br');

			case 'a': {
				const a = this.renderer.createElement('a');
				if (node.url) this.renderer.setAttribute(a, 'href', node.url);
				this.renderer.setAttribute(a, 'target', '_blank');
				this.renderer.setAttribute(a, 'rel', 'noopener noreferrer');
				return a;
			}

			case 'img': {
				const img = this.renderer.createElement('img');
				this.renderer.setAttribute(img, 'src', node.url ?? '');
				const alt = this.extractText(node.content);
				if (alt) this.renderer.setAttribute(img, 'alt', alt);
				// hide broken images
				(img as HTMLImageElement).onerror = () => {
					(img as HTMLElement).style.display = 'none';
				};
				return img;
			}

			// text will fall under default; it's handled in renderTop/renderChildrenInto
			default:
				return null;
		}
	}

	private createHeading(level: 1 | 2 | 3 | 4 | 5 | 6): HTMLElement {
		const tag = `h${level}` as const;
		const el = this.renderer.createElement(tag);

		const elementRef = new ElementRef(el);
		const directive = new HeadingDirective(elementRef);
		directive.ngOnInit();
		this.headingDirectives.push(directive);

		return el;
	}

	private extractText(content: MdNode[] | string | undefined): string {
		if (!content) return '';
		if (typeof content === 'string') return content;
		let out = '';
		for (const c of content) {
			if (c.type === 'text') out += String(c.content ?? '');
			else if (c.content) out += this.extractText(c.content as any);
		}
		return out.trim();
	}
}
