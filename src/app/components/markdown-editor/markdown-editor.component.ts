import { Component, ElementRef, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
import * as vst from '../../types/vs-types';
import { lex, parse, MdNode, MdNodeType } from '../../classes/markdownparser';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownRendererComponent } from '../markdown-renderer/markdown-renderer.component';

@Component({
  selector: 'markdown-editor',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MarkdownRendererComponent],
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.css',
})
export class MarkdownEditorComponent {
  @ViewChild('markdownArea') set content(content: ElementRef) {
    this.textareaRef = content;
    this.textarea = content.nativeElement as HTMLTextAreaElement;
    setTimeout(() => {this.assignCurrentLine(); this.processMd(this.getText())}, 0);
  }

  textChanged: Subject<null> = new Subject;
  textareaRef!: ElementRef;
  textarea!: HTMLTextAreaElement;
  focusedLine?: number;
  lineCount: number[] = [0];
  selectedLineNumber: number = 0;
  selectedLine: HTMLElement | null = null;
  results?: vst.VSExtension;
  markdownControl!: FormControl;
  debounce: number = 300;
  htmlElements: string = '';
  mdTree?: MdNode;
  example: string =
    '# Efe Enes Çamcı\n\n## Testing\n\nYooo *this is italic* and this is *italic*\n';
  // example: string = '# Markdown Benchmark Text\n\n## Basic Formatting\n\nThis is *italic*, **bold**, and ***bold italic***. Some ~~strikethrough~~.\n\n## Lists\n\n1. Ordered list\n2. With nested unordered list:\n   * Item A\n   * Item B\n3. And continuation\n   of the ordered list\n\n- Unordered list\n- With nested ordered list:\n  1. Sub-item 1\n  2. Sub-item 2\n- And continuation\n\n## Code\n\nInline `code` and ``code with `backticks` inside``.\n\n```python\ndef tricky_function():\n    print("This is a code block")\n    # With a comment\n    return None\n```\n\n    Indented code block\n    without language specification\n\n## Blockquotes\n\n> Single-level quote\n>> Nested quote\n> \n> Quote continuation after blank line\n\n## Horizontal Rules\n\n---\n***\n___\n\n## Tables\n\n| Left-aligned | Center-aligned | Right-aligned |\n|:-------------|:--------------:|---------------:|\n| Left | Center | Right |\n| Long cell content | Short | Content |\n\n## Task Lists\n\n- [x] Completed task\n- [ ] Incomplete task\n  - [x] Nested completed task\n  - [ ] Nested incomplete task\n\n## Escaping and Edge Cases\n\n\*Not italic\* and \`not code\`\n\n*Italic with\* escaped asterisk*\n\n**Bold with\** escaped asterisks**\n\nA a \ backslash\n\n<span>HTML tag</span>\n\n<!-- HTML comment -->\n\n### Heading with *italic* and **bold**\n\n[Link](https://example.com/(nested_parentheses))\n\n`Inline code with <html> tags`\n\n    Code block with <html> tags\n    And *asterisks* that should not be italic\n\n> Blockquote with # heading\n> \n> And a [link](https://example.com)\n\n1\. Not a list item\n\n- List item with\n  multiple lines\n  \n  And a paragraph break\n\n* [ ] Task list item with \[escaped\] brackets';

  constructor(private er: ElementRef) {
    this.textChanged.pipe(debounceTime(this.debounce)).subscribe(() => {
      this.processMd(this.getText());
    })
  }

  getText() {
    let finalText: string = "";

    this.textarea.childNodes.forEach((node, idx) => {
      (node as HTMLElement).id = idx.toString();
      finalText += node.textContent + "\n";
    })

    return finalText;
  }

  keyDownEvent(e: KeyboardEvent) {
    setTimeout(() => this.assignCurrentLine(), 0);
    this.textChanged.next(null);
  }

  clickEvent(e: MouseEvent) {
    setTimeout(() => this.assignCurrentLine(), 0);
  }

  onPaste(e: ClipboardEvent | any) {
    e.preventDefault();

    const text = e.clipboardData
      ? (e.originalEvent || e).clipboardData.getData('text/plain')
      : // For IE
      (window as any).clipboardData
      ? (window as any).clipboardData.getData('Text')
      : '';

    if (document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else if (document.getSelection) {
      // Insert text at the current position of caret
      const range = document.getSelection()!.getRangeAt(0);
      range.deleteContents();

      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.selectNodeContents(textNode);
      range.collapse(false);

      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  getCursorLine(): number {
    const selectedNode = window.getSelection();
    if (!selectedNode || !selectedNode!.anchorNode)
      return -1;

    let newSelectedLine = selectedNode!.anchorNode!.parentElement!;
    if (newSelectedLine.id === "markdownArea") {
      newSelectedLine = selectedNode!.anchorNode as HTMLElement;
    }

    if (this.selectedLine !== newSelectedLine) {
      this.selectedLineNumber = Number(newSelectedLine.id);
      newSelectedLine!.style.backgroundColor = 'var(--highlight)';

      if (this.selectedLine) {
        this.selectedLine.style.removeProperty('background-color');
      }

      this.selectedLine = newSelectedLine;
    }

    return 0;
  }

  getNumberofLines(): number {
    return this.textarea.childNodes?.length || 1;
  }

  assignCurrentLine() {
    const currentLine = this.getCursorLine();
    const _lineCount = this.getNumberofLines();

    this.lineCount = [...Array(_lineCount).keys()];
  }

  processMd(md: string = this.example) {
    const lexed = lex(md);
    this.mdTree = parse(lexed);
    // const res = this.traverseMd(this.mdTree);
    console.log(md);
    console.log(lexed);
    console.log(this.mdTree);
    // console.log(res);
    // this.htmlElements = res;
  }

  traverseMd(mdTree: MdNode): string {
    let result = '';
    if (mdTree.type === 'text') {
      return mdTree.content as string;
    } else {
      (mdTree.content as MdNode[]).forEach((c) => {
        if (c.type === 'text') {
          result += c.content;
        } else {
          if (c.type === "bi") {
            result += `<b><i>`;
            result += this.traverseMd(c);
            result += `</b></i>`;
          } else if (c.type === "br") {
            result += `<br>`;
          } else {
            result += `<${c.type}>`;
            result += this.traverseMd(c);
            result += `</${c.type}>`;
          }
        }
      });
    }

    return result;
  }
}
