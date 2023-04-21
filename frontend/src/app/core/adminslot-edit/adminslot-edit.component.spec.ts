import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminslotEditComponent } from './adminslot-edit.component';

describe('AdminslotEditComponent', () => {
  let component: AdminslotEditComponent;
  let fixture: ComponentFixture<AdminslotEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminslotEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminslotEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
