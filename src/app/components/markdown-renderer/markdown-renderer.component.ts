import { Component, Input } from '@angular/core';
import { MdNode } from '../../classes/markdownparser';

@Component({
  selector: 'markdown-renderer',
  standalone: true,
  template: `
    @if (this.parsedNode !== undefined) { 
    @for (node of this.parsedNode; track node) 
    { 
    @switch (node.type) 
    { 
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
    <h1>
      <markdown-renderer class="text-5xl lg:text-6xl font-extrabold" [parsedContent]="node.content"></markdown-renderer>
    </h1>
    } @case ('h2') {
    <h2>
      <markdown-renderer class="text-4xl lg:text-5xl" [parsedContent]="node.content"></markdown-renderer>
    </h2>
    } @case ('h3') {
    <h3>
      <markdown-renderer class="text-3xl lg:text-4xl text-accent1" [parsedContent]="node.content"></markdown-renderer>
    </h3>
    } @case ('h4') {
    <h4>
      <markdown-renderer class="text-2xl lg:text-3xl" [parsedContent]="node.content"></markdown-renderer>
    </h4>
    } @case ('h5') {
    <h5>
      <markdown-renderer class="text-xl lg:text-2xl" [parsedContent]="node.content"></markdown-renderer>
    </h5>
    } @case ('h6') {
    <h6>
      <markdown-renderer class="text-lg lg:text-xl" [parsedContent]="node.content"></markdown-renderer>
    </h6>
    } @case ('code') {
    <pre><code><markdown-renderer [parsedContent]="node.content"></markdown-renderer></code></pre>
    } @case ('bq') {
    <blockquote>
      <markdown-renderer [parsedContent]="node.content"></markdown-renderer>
    </blockquote>
    } @case ('b') {
    <strong
      ><markdown-renderer [parsedContent]="node.content"></markdown-renderer
    ></strong>
    } @case ('i') {
    <em
      ><markdown-renderer [parsedContent]="node.content"></markdown-renderer
    ></em>
    } @case ('bi') {
    <strong
      ><em
        ><markdown-renderer
          [parsedContent]="node.content"
        ></markdown-renderer></em
    ></strong>
    }
    <!-- @case ('a') {
          <a [href]="node.attrs?.href"><markdown-renderer [parsedContent]="node.content"></markdown-renderer></a>
        } -->
    @case ('st') {
    <del
      ><markdown-renderer [parsedContent]="node.content"></markdown-renderer
    ></del>
    } @case ('br') {
    <br />
    } } } }
    <ng-content></ng-content>
  `,
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
