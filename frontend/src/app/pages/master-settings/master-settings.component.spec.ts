import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterSettingsComponent } from './master-settings.component';

describe('MasterSettingsComponent', () => {
  let component: MasterSettingsComponent;
  let fixture: ComponentFixture<MasterSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
