import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingComponent } from './booking/booking.component';
import { PagesRoutingModule } from './pages-routing.module';
import { BookingConfirmationComponent } from './booking/booking-confirmation/booking-confirmation.component';
import { BookingOverviewComponent } from './booking-overview/booking-overview.component';
import { AdminsOverviewComponent } from './admins-overview/admins-overview.component';
import { AdminsEditComponent } from './admins-edit/admins-edit.component';
import { PopupComponent } from './admins-edit/popup/popup.component';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    BookingComponent,
    BookingConfirmationComponent,
    BookingOverviewComponent,
    AdminsOverviewComponent,
    AdminsEditComponent,
    PopupComponent,
  ],
  imports: [CommonModule, PagesRoutingModule, CoreModule],
})
export class PagesModule {}
