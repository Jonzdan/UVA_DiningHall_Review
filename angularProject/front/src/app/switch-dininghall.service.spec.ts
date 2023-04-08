import { TestBed } from '@angular/core/testing';

import { SwitchDininghallService } from './switch-dininghall.service';

describe('SwitchDininghallService', () => {
  let service: SwitchDininghallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwitchDininghallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
