import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminslotComponent } from './adminslot.component';

describe('AdminslotComponent', () => {
  let component: AdminslotComponent;
  let fixture: ComponentFixture<AdminslotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminslotComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminslotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
