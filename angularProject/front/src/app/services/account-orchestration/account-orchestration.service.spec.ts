import { TestBed } from '@angular/core/testing';

import { AccountOrchestrationService } from './account-orchestration.service';

describe('AccountOrchestrationService', () => {
  let service: AccountOrchestrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountOrchestrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
