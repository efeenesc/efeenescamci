import { Component, ElementRef, Input, SecurityContext, ViewEncapsulation } from '@angular/core';
import { MdNode } from '../../classes/markdown';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'markdown-renderer-html',
  imports: [],
  encapsulation: ViewEncapsulation.None,
  template: `
  <div class="md-renderer" [innerHTML]="this.parsedNode"></div>
  `,
  styleUrl: './markdown-renderer-html.component.css'
})

/** 
 * Displays Markdown in HTML by converting the Markdown into an HTML string.
 * Puts the string through sanitization before displaying it. No performance
 * difference between this and markdown-renderer, but it is significantly easier
 * to work with, and the DOM isn't destroyed by the Angular switch-case and Angular compiler.
 */
export class MarkdownRendererHtmlComponent {
  private sanitizer: DomSanitizer;
  parsedNode: string | undefined | null;
  @Input() set parsedContent(content: MdNode[] | string) {
    let parsed: string;

    if (content === '' || content.length === 0) {
      this.parsedNode = "";
      return;
    }

    if (typeof content === 'string') {
      parsed = this.renderNode(new MdNode('text', content));
    } else {
      parsed = content.map((node) => this.renderNode(node)).join('');
    }

    this.parsedNode = this.sanitizer.sanitize(SecurityContext.HTML, parsed);
  }

  constructor(sanitizer: DomSanitizer, private el: ElementRef) {
    this.sanitizer = sanitizer;
  }

  renderNode = (node: MdNode): string => {
    let content: string;
    if (typeof node.content === 'string') {
      content = node.content;
    } else {
      content = node.content.map(this.renderNode).join('\n');
    }
  
    switch (node.type) {
      case 'text':
        return node.content as string;
      case 'p':
        return `<p>${content}</p>`;
      case 'ul':
        return `<ul>${content}</ul>`;
      case 'ol':
        return `<ol>${content}</ol>`;
      case 'li':
        return `<li>${content}</li>`;
      case 'h1':
        return `<h1>${content}</h1>`;
      case 'h2':
        return `<h2>${content}</h2>`;
      case 'h3':
        return `<h3>${content}</h3>`;
      case 'h4':
        return `<h4>${content}</h4>`;
      case 'h5':
        return `<h5>${content}</h5>`;
      case 'h6':
        return `<h6>${content}</h6>`;
      case 'code':
        return `<code>${content}</code>`;
      case 'bq':
        return `<blockquote>${content}</blockquote>`;
      case 'b':
        return `<strong>${content}</strong>`;
      case 'i':
        return `<em>${content}</em>`;
      case 'bi':
        return `<strong><em>${content}</em></strong>`;
      case 'st':
        return `<del>${content}</del>`;
      case 'br':
        return `<br />`;
      case 'img':
        return `<img src="${node.url}" alt="${content}">`
      case 'a':
        return `<a href="${node.url || ''}" target="_blank">${content}</a>`;
      default:
        console.warn(`Unsupported node type: ${node.type}`);
        return '';
    }
  }
}
