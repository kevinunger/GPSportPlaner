import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminsOverviewComponent } from './admins-overview.component';

describe('AdminsOverviewComponent', () => {
  let component: AdminsOverviewComponent;
  let fixture: ComponentFixture<AdminsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminsOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
