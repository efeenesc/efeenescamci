import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownRendererHtmlComponent } from './markdown-renderer-html.component';

describe('MarkdownRendererHtmlComponent', () => {
  let component: MarkdownRendererHtmlComponent;
  let fixture: ComponentFixture<MarkdownRendererHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownRendererHtmlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkdownRendererHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
