import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VsSearchComponent } from './vs-search.component';

describe('VsSearchComponent', () => {
  let component: VsSearchComponent;
  let fixture: ComponentFixture<VsSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VsSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
