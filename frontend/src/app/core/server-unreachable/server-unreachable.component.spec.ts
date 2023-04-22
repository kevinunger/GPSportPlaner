import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerUnreachableComponent } from './server-unreachable.component';

describe('ServerUnreachableComponent', () => {
  let component: ServerUnreachableComponent;
  let fixture: ComponentFixture<ServerUnreachableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerUnreachableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerUnreachableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
