import { Component, ViewChild } from '@angular/core';
import { MarkdownEditorComponent } from '../../components/markdown-editor/markdown-editor.component';
import { MdNode } from '../../classes/markdown';
import { MarkdownRendererComponent } from '../../components/markdown-renderer/markdown-renderer.component';
import { ThemesComponent } from './sections/themes/themes.component';
import { ExperimentsComponent } from "./sections/experiments/experiments.component";

@Component({
    selector: 'home-page',
    imports: [
    MarkdownEditorComponent,
    MarkdownRendererComponent,
    ThemesComponent,
    ExperimentsComponent,
],
    templateUrl: './home-page.component.html'
})
export class HomePageComponent {
  @ViewChild(MarkdownEditorComponent) set content(content: MarkdownEditorComponent) {
    this.mdEditor = content;
    setTimeout(() => {
      this.replaceInitialText();
    }, 0);
  }

  mdEditor!: MarkdownEditorComponent;
  homeText = 
`![Efe Enes Çamcı](https://avatars.githubusercontent.com/u/79850104?v=4)



# Efe Enes Çamcı
### Solutions Architect

I develop websites, desktop programs, mobile apps; increase organizational security, automate business-critical workflows, manage cloud infrastructure; experiment with ideas, take on new challenges, reinvent the wheel, and have fun.

**[GitHub](https://github.com/efeenesc)** -
**[LinkedIn](https://linkedin.com/in/efeenescamci)** -
**[E-mail](mailto:hello@efeenescamci.com)**`

  markdown?: MdNode;

  constructor() {}

  async replaceInitialText() {
    for (const i of [...Array(this.homeText.length).keys()]) {
      this.mdEditor.inputText(this.homeText.substring(0, i), i % 30 == 0);
      // if (i > 30 && i % 30 == 0) return;
      await this.delay(10);
    }

    this.mdEditor.inputText(this.homeText);
  }

  markdownChanged(newMd: MdNode) {
    this.markdown = newMd;
    console.log(this.markdown);
  }

  delay(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }
}
