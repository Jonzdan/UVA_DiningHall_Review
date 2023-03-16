import { TestBed } from '@angular/core/testing';

import { NavSideBarService } from './nav-side-bar.service';

describe('NavSideBarService', () => {
  let service: NavSideBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavSideBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
