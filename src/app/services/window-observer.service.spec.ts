import { TestBed } from '@angular/core/testing';

import { WindowObserverService } from './window-observer.service';

describe('WindowObserverService', () => {
  let service: WindowObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
