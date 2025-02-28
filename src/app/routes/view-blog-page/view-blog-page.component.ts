import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkdownEditorComponent } from '../../components/markdown-editor/markdown-editor.component';
import { MdNode } from '../../classes/markdown';
import { MarkdownRendererHtmlComponent } from '../../components/markdown-renderer-html/markdown-renderer-html.component';
import { SkeletonLoaderComponent } from '../../components/skeleton-loader/skeleton-loader.component';
import { Meta } from '@angular/platform-browser';
import gsap from "gsap";

@Component({
  selector: 'view-blog-page',
  imports: [
    MarkdownEditorComponent,
    MarkdownRendererHtmlComponent,
    SkeletonLoaderComponent,
],
  templateUrl: './view-blog-page.component.html',
})
export class ViewBlogPageComponent {
  @ViewChild(MarkdownEditorComponent) set content(
    content: MarkdownEditorComponent
  ) {
    this.mdEditor = content;

    if (this.markdownText) {
      this.mdEditor.inputText(this.markdownText);
    }
  }
  @ViewChild(MarkdownEditorComponent, { read: ElementRef }) mdEditorRef!: ElementRef;
  mdEditor!: MarkdownEditorComponent;

  private _blogPost: FullBlog | null = null;
  public get blogPost(): FullBlog | null {
    return this._blogPost;
  }
  public set blogPost(value: FullBlog | null) {
    this._blogPost = value;
    this.markdownText = value?.content ?? '';
  }

  private _markdownText?: string;
  public get markdownText(): string | undefined {
    return this._markdownText;
  }
  public set markdownText(value: string | undefined) {
    this._markdownText = value;
    if (this.mdEditor) {
      this.mdEditor.inputText(value ?? '');
    }
  }

  private _editingEnabled: boolean = false;
  public get editingEnabled(): boolean {
    return this._editingEnabled;
  }
  public set editingEnabled(value: boolean) {
    this._editingEnabled = value;
    this.animateEditorAppear(value);
  }

  markdownNode?: MdNode;

  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta
  ) {
    this.route.data.subscribe((data) => {
      const blogPost = data['blogPost'] as FullBlog | null;
      if (blogPost) {
        this.blogPost = blogPost;
        this.updateMetaTags(blogPost);
        this.isLoading = false;
      } else {
        this.router.navigateByUrl('/404');
      }
    });
  }

  updateMetaTags(blog: FullBlog) {
    this.meta.updateTag({ property: 'og:title', content: blog.title + " - efeenescamci.com" });
    this.meta.updateTag({ property: 'og:url', content: this.router.url });
  }

  fillText(text: string) {
    this.mdEditor.inputText(text);
  }

  markdownChanged(newMd: MdNode) {
    this.markdownNode = newMd;
  }

  editButtonClicked() {
    this.editingEnabled = !this.editingEnabled;
  }

  animateEditorAppear(visible: boolean) {
    gsap.to(this.mdEditorRef.nativeElement, {
      opacity: visible ? 1.0 : 0.0,
      duration: 0.2,
      onStart: () => {
        if (visible)
          (this.mdEditorRef.nativeElement as unknown as HTMLDivElement).style.display = "flex";
      },
      onComplete: () => {
        if (!visible)
          (this.mdEditorRef.nativeElement as unknown as HTMLDivElement).style.display = "hidden";
      }
    })
  }
}
