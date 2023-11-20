import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { BookingOverviewComponent } from './booking-overview/booking-overview.component';
import { AdminsOverviewComponent } from './admins-overview/admins-overview.component';
import { AdminsEditComponent } from './admins-edit/admins-edit.component';
import { HomeComponent } from './home/home.component';
import { AdminsSettingsComponent } from './admins-settings/admins-settings.component';
import { MasterSettingsComponent } from './master-settings/master-settings.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { InfoComponent } from './info/info.component';
import { AuthGuard } from '../services/auth.guard';
import { RulesComponent } from './rules/rules.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'rules',
    component: RulesComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'booking',
    component: BookingComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'overview',
    component: BookingOverviewComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'admins',
    component: AdminsOverviewComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'admins/edit',
    component: AdminsEditComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' },
  },
  {
    path: 'settings',
    component: UserSettingsComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'admins/settings',
    component: AdminsSettingsComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' },
  },
  {
    path: 'master/settings',
    component: MasterSettingsComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'master' },
  },
  {
    path: 'info',
    component: InfoComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
