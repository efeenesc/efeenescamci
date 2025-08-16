import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidepanelTocComponent } from './sidepanel-toc.component';

describe('SidepanelTocComponent', () => {
  let component: SidepanelTocComponent;
  let fixture: ComponentFixture<SidepanelTocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidepanelTocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidepanelTocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
