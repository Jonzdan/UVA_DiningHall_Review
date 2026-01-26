import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsTabProfileComponent } from './settings-tab-profile.component';

describe('SettingsTabProfileComponent', () => {
  let component: SettingsTabProfileComponent;
  let fixture: ComponentFixture<SettingsTabProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsTabProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsTabProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
