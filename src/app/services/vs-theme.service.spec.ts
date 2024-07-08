import { TestBed } from '@angular/core/testing';

import { VsThemeService } from './vs-theme.service';

describe('VsThemeService', () => {
  let service: VsThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VsThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
