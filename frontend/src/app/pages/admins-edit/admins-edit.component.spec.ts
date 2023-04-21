import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminsEditComponent } from './admins-edit.component';

describe('AdminsEditComponent', () => {
  let component: AdminsEditComponent;
  let fixture: ComponentFixture<AdminsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminsEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
