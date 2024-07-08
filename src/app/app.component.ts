import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VsSearchComponent } from './components/vs-search/vs-search.component';
import { MarkdownEditorComponent } from './components/markdown-editor/markdown-editor.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VsSearchComponent, MarkdownEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'efeenescamci';
}
