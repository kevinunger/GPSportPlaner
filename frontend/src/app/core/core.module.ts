import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { TimeslotComponent } from './timeslot/timeslot.component';
import { AdminslotComponent } from './adminslot/adminslot.component';
import { AdminslotEditComponent } from './adminslot-edit/adminslot-edit.component';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuEntryComponent } from './header/menu-entry/menu-entry.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    HeaderComponent,
    TimeslotComponent,
    AdminslotComponent,
    AdminslotEditComponent,
    MenuEntryComponent,
    FooterComponent,
  ],
  imports: [CommonModule, SharedModule, FontAwesomeModule, RouterModule],
  exports: [FooterComponent, HeaderComponent, TimeslotComponent, AdminslotComponent, AdminslotEditComponent],
})
export class CoreModule {}
