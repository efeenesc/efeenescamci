import {
  Component,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import * as vst from '../../types/vs-types';
import { ConvertToHtmlTree, MdNode } from '../../classes/markdown/Markdown';
import { MarkdownRendererComponent } from '../markdown-renderer/markdown-renderer.component';

@Component({
  selector: 'markdown-editor',
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, ReactiveFormsModule, MarkdownRendererComponent],
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.css',
})
export class MarkdownEditorComponent {
  @ViewChild('markdownArea') set content(content: ElementRef) {
    this.textarea = content.nativeElement as HTMLTextAreaElement;
    setTimeout(() => {
      this.assignCurrentLine();
      this.processMd(this.getText());
    }, 0);
  }
  @Input() showRenderer: boolean = true;
  @Output() result: EventEmitter<MdNode> = new EventEmitter();

  textChanged: Subject<null> = new Subject();
  textarea!: HTMLTextAreaElement;
  focusedLine?: number;
  lineCount: number[] = [0];
  selectedLineNumber: number = 0;
  selectedLine: HTMLElement | null = null;
  selectedLineDiv: HTMLElement | null = null;

  results?: vst.VSExtension;
  markdownControl!: FormControl;
  debounce: number = 300;
  htmlElements: string = '';
  mdTree?: MdNode;

  constructor() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(
        new URL('../../workers/markdown-runner.worker.ts', import.meta.url)
      );
      worker.onmessage = ({ data }) => {
        if (this.showRenderer) this.mdTree = data;

        this.result.emit(data);
      };

      this.textChanged.pipe(debounceTime(this.debounce)).subscribe(() => {
        worker.postMessage(this.getText());
      });
    } else {
      this.textChanged.pipe(debounceTime(this.debounce)).subscribe(() => {
        this.processMd(this.getText());
      });
    }
  }

  ngOnInit() {
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (sel!.anchorOffset !== sel!.focusOffset) {
        if (this.selectedLine) {
          this.selectedLine.classList.remove('selected');
          this.selectedLine = null;
        }
        return;
      }

      this.getCursorLine(sel!);
    });
  }

  inputText(newText: string) {
    const splitText = newText.split('\n');
    const html = splitText
      .map((line) =>
        !line.trim() ? '<div><br></div>' : '<div>' + line + '</div>'
      )
      .join('');
    this.textarea.innerHTML = html;
    this.textChanged.next(null);

    const sel = window.getSelection();
    this.getCursorLine(sel!);
  }

  checkDOM() {
    this.textarea.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        // Check if the node is a text node
        const div = document.createElement('div'); // Create a new div
        div.textContent = n.textContent; // Set the text content of the div
        this.textarea.replaceChild(div, n); // Replace the text node with the div
      }
    });
  }

  getText() {
    let finalText: string = '';

    this.textarea.childNodes.forEach((node, idx) => {
      (node as HTMLElement).id = idx.toString();
      finalText += node.textContent + '\n';
    });

    return finalText;
  }

  keyDownEvent(ev: KeyboardEvent) {
    // Prevent deleting the only <br> inside an empty textarea div
    if (
      (ev.key === 'Backspace' || ev.key === 'Delete') &&
      this.textarea.innerText === '\n'
    ) {
      ev.preventDefault();
      return;
    }

    setTimeout(() => this.assignCurrentLine(), 0);
    this.textChanged.next(null);
  }

  clickEvent() {
    setTimeout(() => this.assignCurrentLine(), 0);
    this.checkDOM();
  }

  /* 
  Get plaintext content only from the user's clipboard.
  Should work in modern browsers and IE
  */
  onPaste(e: ClipboardEvent | any) {
    e.preventDefault();

    let text: string;

    if (e.clipboardData) {
      // Modern browsers
      text = (e.originalEvent || e).clipboardData.getData('text/plain');
    } else if ((window as any).clipboardData) {
      // IE
      text = (window as any).clipboardData.getData('Text');
    } else {
      console.error('Could not access the clipboard');
      return;
    }

    if (document.queryCommandSupported('insertText')) {
      console.log('Command supported');
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

  getCursorLine(selectedNode: Selection): number {
    if (!selectedNode?.anchorNode) return -1;

    let currentElement = selectedNode.anchorNode.parentElement!;

    if (currentElement?.nodeName === 'SPAN') {
      currentElement = currentElement.parentElement!;
    }

    if (currentElement?.id === 'markdownArea') {
      currentElement = selectedNode.anchorNode as HTMLElement;
    }

    const lineNumber = Array.prototype.indexOf.call(
      this.textarea.childNodes,
      currentElement
    );

    if (lineNumber === -1) {
      if (this.selectedLine) {
        this.selectedLine.classList.remove('selected');
        this.selectedLine = null;
      }
      return -1;
    }

    if (this.selectedLine !== currentElement) {
      currentElement!.classList.add('selected');

      // Workaround for a Chrome bug that gives a background color to <span> element inside line <div>s

      currentElement.childNodes.forEach((node) => {
        if (node.nodeType !== 3)
          (node as HTMLSpanElement).style!.removeProperty('background-color')
      })
      this.selectedLine?.classList.remove('selected');

      this.selectedLine = currentElement;
    }

    this.selectedLineNumber = lineNumber;
    return 0;
  }

  getNumberofLines(): number {
    return this.textarea.childNodes?.length || 1;
  }

  assignCurrentLine() {
    const _lineCount = this.getNumberofLines();

    this.lineCount = [...Array(_lineCount).keys()];
  }

  processMd(md: string) {
    const mdTree = ConvertToHtmlTree(md);
    if (this.showRenderer) this.mdTree = mdTree;

    this.result.emit(mdTree);
  }
}
