import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { BurgerMenuComponent } from './burger-menu/burger-menu.component';
import { TimeslotComponent } from './timeslot/timeslot.component';
import { TimeslotViewComponent } from './timeslot-view/timeslot-view.component';
import { AdminslotComponent } from './adminslot/adminslot.component';
import { AdminslotEditComponent } from './adminslot-edit/adminslot-edit.component';

@NgModule({
  declarations: [
    HeaderComponent,
    BurgerMenuComponent,
    TimeslotComponent,
    TimeslotViewComponent,
    AdminslotComponent,
    AdminslotEditComponent,
  ],
  imports: [CommonModule],
})
export class CoreModule {}
