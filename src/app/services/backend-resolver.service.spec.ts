import { TestBed } from '@angular/core/testing';

import { BackendResolverService } from './backend-resolver.service';

describe('BackendResolverService', () => {
  let service: BackendResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
