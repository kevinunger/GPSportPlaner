import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { BookingOverviewComponent } from './booking-overview/booking-overview.component';
import { AdminsOverviewComponent } from './admins-overview/admins-overview.component';
import { AdminsEditComponent } from './admins-edit/admins-edit.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'booking',
    pathMatch: 'full',
  },
  {
    path: 'booking',
    component: BookingComponent,
  },
  {
    path: 'overview',
    component: BookingOverviewComponent,
  },
  {
    path: 'admins',
    component: AdminsOverviewComponent,
  },
  {
    path: 'admins/edit',
    component: AdminsEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
