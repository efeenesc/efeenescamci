import {
	Directive,
	ViewContainerRef,
	Renderer2,
	OnChanges,
	OnDestroy,
	ElementRef,
	input,
} from '@angular/core';
import { ASTNode, ASTRootNode } from '@classes/markdown/parser.interface';
import { HeadingDirective } from './heading.directive';

@Directive({
	selector: '[markdownRenderer]',
	standalone: true,
})
export class MarkdownRendererDirective implements OnChanges, OnDestroy {
	nodes = input<ASTRootNode | null>(undefined, { alias: 'markdownRenderer' });

	private topLevelCreated: { node: Node; directive?: HeadingDirective }[] = [];
	private headingDirectives: HeadingDirective[] = [];

	constructor(
		private vcr: ViewContainerRef,
		private renderer: Renderer2,
	) {
		console.log('1:', this.nodes());
	}

	ngOnChanges(): void {
		this.clear();
		console.log('2:', this.nodes());
		// console.log(this.nodes()!.value);
		if (!this.nodes() || this.nodes()!.value.length === 0) return;

		for (const n of this.nodes()!.value) {
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

	private renderTop(node: ASTNode): void {
		// top-level nodes are inserted before the anchor
		switch (node.type) {
			case 'TEXT': {
				const t = this.renderer.createText(String(node.value ?? ''));
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

	private renderChildrenInto(parentEl: HTMLElement, node: ASTNode): void {
		const content = node.value;
		if (!content) return;

		if (typeof content === 'string') {
			this.renderer.appendChild(parentEl, this.renderer.createText(content));
			return;
		}

		for (const child of content) {
			if (child.type === 'TEXT') {
				this.renderer.appendChild(
					parentEl,
					this.renderer.createText(String(child.value ?? '')),
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

	private createElementFor(node: ASTNode): HTMLElement | null {
		switch (node.type) {
			// block nodes
			case 'PARAGRAPH':
				return this.renderer.createElement('p');
			case 'BREAKLINE':
				return this.renderer.createElement('br');
			case 'ORDEREDLIST':
				return this.renderer.createElement('ol');
			case 'UNORDEREDLIST':
				return this.renderer.createElement('ul');
			case 'LISTITEM':
				return this.renderer.createElement('li');
			case 'STRONG': {
				const strong = this.renderer.createElement('strong');
				const em = this.renderer.createElement('em');
				this.renderer.appendChild(strong, em);
				(strong as any).__innerTarget = em as HTMLElement;
				return strong;
			}
			case 'TEXT':
				return this.renderer.createText(node.value);
			case 'INLINECODE':
			case 'BLOCKCODE':
				return this.renderer.createElement('code');
			case 'BLOCKQUOTE':
				return this.renderer.createElement('blockquote');

			// headings with optional hook
			case 'HEADING':
				return this.createHeading(node.level as any);

			// inline formatting
			case 'BOLD':
				return this.renderer.createElement('strong');
			case 'ITALIC':
				return this.renderer.createElement('em');
			case 'STRIKETHROUGH':
				return this.renderer.createElement('del');
			case 'LINK': {
				const a = this.renderer.createElement('a');
				if (node.url) this.renderer.setAttribute(a, 'href', node.url);
				this.renderer.setAttribute(a, 'target', '_blank');
				this.renderer.setAttribute(a, 'rel', 'noopener noreferrer');
				return a;
			}
			case 'IMAGE': {
				const img = this.renderer.createElement('img');
				this.renderer.setAttribute(img, 'src', node.url ?? '');
				const alt = this.extractText(node.value);
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

	private extractText(content: ASTNode[] | string | undefined): string {
		if (!content) return '';
		if (typeof content === 'string') return content;
		let out = '';
		for (const c of content) {
			if (c.type === 'TEXT') out += String(c.value ?? '');
			else if (c.value) out += this.extractText(c.value as any);
		}
		return out.trim();
	}
}
