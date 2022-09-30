import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DininghallComponent } from './dininghall.component';

describe('DininghallComponent', () => {
  let component: DininghallComponent;
  let fixture: ComponentFixture<DininghallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DininghallComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DininghallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
