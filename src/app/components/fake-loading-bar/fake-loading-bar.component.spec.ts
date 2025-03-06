import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeLoadingBarComponent } from './fake-loading-bar.component';

describe('FakeLoadingBarComponent', () => {
  let component: FakeLoadingBarComponent;
  let fixture: ComponentFixture<FakeLoadingBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FakeLoadingBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FakeLoadingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
