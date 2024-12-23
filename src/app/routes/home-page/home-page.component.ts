import { Component, ViewChild } from '@angular/core';
import { MarkdownEditorComponent } from '../../components/markdown-editor/markdown-editor.component';
import { MdNode } from '../../classes/markdown';
import { ThemesComponent } from './sections/themes/themes.component';
import { ExperimentsComponent } from './sections/experiments/experiments.component';
import { BlogSectionComponent } from './sections/blog/blog.component';
import { MarkdownRendererHtmlComponent } from '../../components/markdown-renderer-html/markdown-renderer-html.component';
import { WindowObserverService } from '../../services/window-observer.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'home-page',
  imports: [
    MarkdownEditorComponent,
    MarkdownRendererHtmlComponent,
    ThemesComponent,
    ExperimentsComponent,
    BlogSectionComponent,
    MarkdownRendererHtmlComponent,
    FooterComponent,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  @ViewChild(MarkdownEditorComponent) set content(
    content: MarkdownEditorComponent
  ) {
    this.mdEditor = content;
    setTimeout(() => {
      this.fillWelcomeText();
    }, 0);
  }

  mdEditor!: MarkdownEditorComponent;
  homeText = `![Efe Enes Çamcı](https://avatars.githubusercontent.com/u/79850104?v=4)



# Efe Enes Çamcı
### Solutions Architect

I develop websites, desktop programs, mobile apps; increase organizational security, automate business-critical workflows, manage cloud infrastructure; experiment with ideas, take on new challenges, reinvent the wheel, and have fun.

**[GitHub](https://github.com/efeenesc)** - 
**[LinkedIn](https://linkedin.com/in/efeenescamci)** - 
**[E-mail](mailto:hello@efeenescamci.com)**`;

  markdown?: MdNode;
  isInitialLoad: boolean = true;

  constructor(private wndSvc: WindowObserverService) {
    this.isInitialLoad = this.wndSvc.firstOpenedPage;
  }

  async fillWelcomeText() {
    if (window.innerWidth < 1280 || !this.isInitialLoad) {
      this.mdEditor.inputText(this.homeText);
    } else {
      await this.mdEditor.animateTextIn(this.homeText);
    }
  }

  markdownChanged(newMd: MdNode) {
    this.markdown = newMd;
  }
}
