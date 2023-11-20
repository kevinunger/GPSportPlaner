import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { IAdmin } from 'src/app/types/index';
import { TranslocoService } from '@ngneat/transloco';

interface IAdminsPerDay {
  Monday: IAdmin[];
  Tuesday: IAdmin[];
  Wednesday: IAdmin[];
  Thursday: IAdmin[];
  Friday: IAdmin[];
  Saturday: IAdmin[];
  Sunday: IAdmin[];
}

@Component({
  selector: 'app-admins-overview',
  templateUrl: './admins-overview.component.html',
  styleUrls: ['./admins-overview.component.scss'],
})
export class AdminsOverviewComponent implements OnInit {
  constructor(private adminService: AdminService, private translocoService: TranslocoService) {}

  admins: IAdmin[] = [];
  adminsPerDay: IAdminsPerDay = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  sortedAdminsPerDay: { day: string; admins: IAdmin[] }[] = [];

  ngOnInit(): void {
    this.adminService.fetchAndSetAdmins().subscribe(
      () => {
        this.adminService.getAdmins().subscribe(admins => {
          this.admins = admins;
          if (!this.admins) return;
          this.admins.forEach(admin => {
            this.adminsPerDay[admin.assignedDay].push(admin);
          });
          this.sortedAdminsPerDay = Object.entries(this.adminsPerDay)
            .map(([day, admins]) => ({ day, admins }))
            .sort((a, b) => {
              const order = [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ];
              return order.indexOf(a.day) - order.indexOf(b.day);
            });
        });

        // translate weekdays !not ideal!
        this.sortedAdminsPerDay.forEach(day => {
          console.log(this.translocoService.translate(`adminOverview.weekdays.dayMonday`));
          day.day = this.translocoService.translate(`adminOverview.weekdays.${day.day}`);
        });
      },
      (error: any) => {
        console.error('Error fetching admins:', error);
      }
    );
  }
}
