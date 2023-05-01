import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminsSettingsComponent } from './admins-settings.component';

describe('AdminsSettingsComponent', () => {
  let component: AdminsSettingsComponent;
  let fixture: ComponentFixture<AdminsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminsSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
