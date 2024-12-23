import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBlogPageComponent } from './view-blog-page.component';

describe('ViewBlogPageComponent', () => {
  let component: ViewBlogPageComponent;
  let fixture: ComponentFixture<ViewBlogPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBlogPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBlogPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
