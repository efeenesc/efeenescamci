import { TestBed } from '@angular/core/testing';

import { ScrollObserverService } from './scroll-observer.service';

describe('ScrollObserverService', () => {
  let service: ScrollObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
