import { Component, Input } from '@angular/core';
import { MdNode } from '../../classes/markdown/Markdown';

@Component({
  selector: 'markdown-renderer',
  template: `
    @if (this.parsedNode !== undefined) 
    { 
      @for (node of this.parsedNode; track node) 
        { 
          @switch (node.type) {
              @case ('text') {
              {{ node.content }}
            } @case ('p') {
              <p>
                <markdown-renderer [parsedContent]="node.content"></markdown-renderer>
              </p>
            } @case ('ul') {
              <ul>
                <markdown-renderer [parsedContent]="node.content"></markdown-renderer>
              </ul>
            } @case ('ol') {
              <ol>
                <markdown-renderer [parsedContent]="node.content"></markdown-renderer>
              </ol>
            } @case ('li') {
              <li>
                <markdown-renderer [parsedContent]="node.content"></markdown-renderer>
              </li>
            } @case ('h1') {
              <h1 class="text-[45px] mb-2 md:text-5xl lg:text-6xl font-extrabold">
                <markdown-renderer
                  [parsedContent]="node.content"
                ></markdown-renderer>
              </h1>
            } @case ('h2') {
              <h2 class="text-4xl mb-2 lg:text-5xl">
                <markdown-renderer
                  [parsedContent]="node.content"
                ></markdown-renderer>
              </h2>
            } @case ('h3') {
              <h3 class="text-3xl mb-2 lg:text-4xl text-accent1">
                <markdown-renderer
                  [parsedContent]="node.content"
                ></markdown-renderer>
              </h3>
            } @case ('h4') {
              <h4 class="text-2xl lg:text-3xl">
                <markdown-renderer
                  [parsedContent]="node.content"
                ></markdown-renderer>
              </h4>
            } @case ('h5') {
              <h5 class="text-xl lg:text-2xl">
                <markdown-renderer
                  [parsedContent]="node.content"
                ></markdown-renderer>
              </h5>
            } @case ('h6') {
              <h6 class="text-lg lg:text-xl">
                <markdown-renderer
                  [parsedContent]="node.content"
                ></markdown-renderer>
              </h6>
            } @case ('code') {
              <code
                ><markdown-renderer [parsedContent]="node.content"></markdown-renderer
              ></code>
            } @case ('bq') {
              <blockquote>
                <markdown-renderer [parsedContent]="node.content"></markdown-renderer>
              </blockquote>
            } @case ('b') {
              <strong>
                <markdown-renderer [parsedContent]="node.content"></markdown-renderer>
              </strong>
            } @case ('i') {
              <em>
                <markdown-renderer [parsedContent]="node.content"></markdown-renderer>
              </em>
            } @case ('bi') {
              <strong
                ><em
                  ><markdown-renderer
                    [parsedContent]="node.content"
                  ></markdown-renderer></em
              ></strong>
            } @case ('st') {
              <del
                ><markdown-renderer [parsedContent]="node.content"></markdown-renderer
              ></del>
            } @case ('br') {
              <br />
            } @case ('a') {
              <a [href]="node.url" target="_blank">
                <markdown-renderer [parsedContent]="node.content"></markdown-renderer>
              </a>
            }
          } 
        } 
      }
  `,
  styles: `
  * {
    text-wrap: pretty;
  }

  strong {
    font-weight: 800;
    display: inline-block;
  }

  ul {
    margin-top: 12px;
    margin-bottom: 4px;
    display: block;
    list-style-type: disc;
    margin-top: 1em;
    margin-bottom: 1 em;
    margin-left: 0;
    margin-right: 0;
    padding-left: 40px;
  }

  code {
    margin-left: 6px;
    margin-right: 0px;
  }

  a {
    text-decoration: underline;
    text-decoration-color: inherit;
    cursor: pointer;
    display: inline-block;
    margin: 0px;
    padding: 0px;
  }

  br {
    content: "";
    display: block;
    height: 10px;
    width: 100px;
  }

  blockquote {
    @apply rounded-lg p-3 bg-theme-300;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 40px;
    margin-inline-end: 40px;
    unicode-bidi: isolate;
    text-wrap: wrap;
  }

  ol {
    display: block;
    list-style-type: decimal;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    padding-inline-start: 40px;
    unicode-bidi: isolate;
  }

  @media (prefers-color-scheme: light) {
    a {
      text-decoration-color: inherit;
    }
  }`,
  imports: [],
})
export class MarkdownRendererComponent {
  parsedNode: MdNode[] | undefined;
  @Input() set parsedContent(content: MdNode[] | string) {
    if (typeof content === 'string') {
      this.parsedNode = [new MdNode('text', content)];
    } else {
      this.parsedNode = content;
    }
  }
}
