import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideCarComponent } from './side-car.component';

describe('SideCarComponent', () => {
  let component: SideCarComponent;
  let fixture: ComponentFixture<SideCarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideCarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
