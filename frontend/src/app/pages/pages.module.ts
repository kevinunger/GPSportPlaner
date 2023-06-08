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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HomeComponent } from './home/home.component';
import { AdminsSettingsComponent } from './admins-settings/admins-settings.component';
import { MasterSettingsComponent } from './master-settings/master-settings.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { InfoComponent } from './info/info.component';
import { RulesComponent } from './rules/rules.component';

@NgModule({
  declarations: [
    BookingComponent,
    BookingConfirmationComponent,
    BookingOverviewComponent,
    AdminsOverviewComponent,
    AdminsEditComponent,
    PopupComponent,
    HomeComponent,
    AdminsSettingsComponent,
    MasterSettingsComponent,
    UserSettingsComponent,
    InfoComponent,
    RulesComponent,
  ],
  imports: [FontAwesomeModule, CommonModule, PagesRoutingModule, CoreModule, SharedModule],
})
export class PagesModule {}
