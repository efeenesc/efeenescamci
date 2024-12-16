import { Component, ViewChild } from '@angular/core';
import { MarkdownEditorComponent } from '../../../../components/markdown-editor/markdown-editor.component';
import { MdNode } from '../../../../classes/markdown';

@Component({
  selector: 'experiments-section',
  imports: [],
  templateUrl: './experiments.component.html',
  styles: `
  :host {
    display: flex;
    width: 100%;
  }
  `,
})
export class ExperimentsComponent {
  @ViewChild(MarkdownEditorComponent) set content(
    content: MarkdownEditorComponent
  ) {
    this.mdEditor = content;
    setTimeout(() => {
      this.replaceInitialText();
    }, 0);
  }

  mdEditor!: MarkdownEditorComponent;
  markdown?: MdNode;
  expCards = [
    {
      icon_url: "https://github.com/efeenesc/recap/raw/master/assets/appicon.png",
      name: "Recap",
      desc: "Get a Recap of your daily activity. Built using Go and Wails.",
      source_url: "",
      read_more: ""
    },
    {
      icon_url: "https://github.com/efeenesc/c-twig-server/raw/main/assets/icon.png",
      name: "c-twig-server",
      desc: "C server as durable as a twig found in the wild. Educational purposes only.",
      source_url: "",
      read_more: ""
    },
    {
      icon_url: "assets/efeenescamci-logo.png",
      name: "efeenescamci",
      desc: "This website. Built with Angular.",
      source_url: "",
      read_more: ""
    }
  ]

  constructor() {}

  replaceInitialText() {
    this.mdEditor.inputText(
`![Logo](https://github.com/efeenesc/recap/raw/master/assets/appicon.png)

# Recap

- Go
- SvelteKit
- Wails

A take on the idea of Microsoft Recall with the purpose of generating reports of user activity.

With its default configuration, it captures a screenshot of all displays every 5 minutes. Every 2 hours, all unprocessed screenshots are sent to the user's preferred vision model to process them and describe the user's activity.

A report can be generated by the user at any time by selecting screenshots through the user interface and clicking the 'Report' button. A report will be generated with screenshots from today, which will be accessible from the 'Reports' page.
`
    );
  }

  markdownChanged(newMd: MdNode) {
    this.markdown = newMd;
    console.log(this.markdown);
  }
}
