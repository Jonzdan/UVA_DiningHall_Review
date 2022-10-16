import { TestBed } from '@angular/core/testing';

import { AppReviewService } from './app-review.service';

describe('AppReviewService', () => {
  let service: AppReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
