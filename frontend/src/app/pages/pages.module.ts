import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingComponent } from './booking/booking.component';
import { PagesRoutingModule } from './pages-routing.module';
import { BookingConfirmationComponent } from './booking/booking-confirmation/booking-confirmation.component';
import { BookingOverviewComponent } from './booking-overview/booking-overview.component';
import { AdminsOverviewComponent } from './admins-overview/admins-overview.component';
import { AdminsEditComponent } from './admins-edit/admins-edit.component';
import { PopupComponent } from './admins-edit/popup/popup.component';

@NgModule({
  declarations: [BookingComponent, BookingConfirmationComponent, BookingOverviewComponent, AdminsOverviewComponent, AdminsEditComponent, PopupComponent],
  imports: [CommonModule, PagesRoutingModule],
})
export class PagesModule {}
