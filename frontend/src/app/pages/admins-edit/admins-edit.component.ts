import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { Day, IAdmin } from 'src/app/types';
import { TranslocoService } from '@jsverse/transloco';

interface AdminForm {
  name: string;
  phoneNumber: string;
  assignedDay: Day;
  roomNumber: string;
  houseNumber: string;
  isAvailable: boolean;
}

@Component({
  selector: 'app-admins-edit',
  standalone: false,
  templateUrl: './admins-edit.component.html',
  styleUrls: ['./admins-edit.component.scss'],
})
export class AdminsEditComponent implements OnInit {
  readonly dayOptions: Day[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  admins: IAdmin[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  editingAdmin: IAdmin | null = null;

  form: AdminForm = this.createEmptyForm();

  constructor(
    private adminService: AdminService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  trackByAdmin(_: number, admin: IAdmin): string {
    return typeof admin._id === 'string' ? admin._id : this.getAdminIdentity(admin);
  }

  getDayLabel(day: Day): string {
    return this.translocoService.translate(`adminOverview.weekdays.${day}`);
  }

  onInput<K extends keyof AdminForm>(key: K, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;

    this.form = {
      ...this.form,
      [key]: value,
    };
  }

  startCreate(): void {
    this.editingAdmin = null;
    this.form = this.createEmptyForm();
    this.clearMessages();
  }

  startEdit(admin: IAdmin): void {
    this.editingAdmin = admin;
    this.form = {
      name: admin.name,
      phoneNumber: admin.phoneNumber,
      assignedDay: admin.assignedDay,
      roomNumber: admin.roomNumber,
      houseNumber: admin.houseNumber,
      isAvailable: admin.isAvailable,
    };
    this.clearMessages();
  }

  cancelEdit(): void {
    this.startCreate();
  }

  submit(): void {
    this.clearMessages();
    if (!this.isFormValid()) {
      this.errorMessage = this.translocoService.translate('adminEdit.validationError');
      return;
    }

    const payload: IAdmin = {
      name: this.form.name.trim(),
      phoneNumber: this.form.phoneNumber.trim(),
      assignedDay: this.form.assignedDay,
      roomNumber: this.form.roomNumber.trim(),
      houseNumber: this.form.houseNumber.trim(),
      isAvailable: this.form.isAvailable,
    };

    this.saving = true;
    const isEditing = !!this.editingAdmin;
    const request$ = this.editingAdmin
      ? this.adminService.editAdmin(this.editingAdmin, payload)
      : this.adminService.addAdmin(payload);

    request$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.startCreate();
          this.successMessage = this.translocoService.translate(
            isEditing ? 'adminEdit.editSuccess' : 'adminEdit.createSuccess'
          );
          this.loadAdmins();
        },
        error: error => {
          this.errorMessage = error?.error?.message || error?.error?.error || 'Unbekannter Fehler';
        },
      });
  }

  deleteAdmin(admin: IAdmin): void {
    this.clearMessages();
    this.saving = true;
    this.adminService
      .deleteAdmin(admin)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          if (
            this.editingAdmin &&
            this.getAdminIdentity(this.editingAdmin) === this.getAdminIdentity(admin)
          ) {
            this.startCreate();
          }
          this.successMessage = this.translocoService.translate('adminEdit.deleteSuccess');
          this.loadAdmins();
        },
        error: error => {
          this.errorMessage = error?.error?.message || error?.error?.error || 'Unbekannter Fehler';
        },
      });
  }

  private loadAdmins(): void {
    this.loading = true;
    this.adminService
      .fetchAndSetAdmins()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          this.admins = [...response.data].sort((a, b) => {
            const dayCompare =
              this.dayOptions.indexOf(a.assignedDay) - this.dayOptions.indexOf(b.assignedDay);
            if (dayCompare !== 0) {
              return dayCompare;
            }
            return a.name.localeCompare(b.name);
          });
        },
        error: error => {
          this.errorMessage = error?.error?.message || error?.error?.error || 'Unbekannter Fehler';
        },
      });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private isFormValid(): boolean {
    return (
      this.form.name.trim().length > 0 &&
      this.form.phoneNumber.trim().length > 0 &&
      this.form.roomNumber.trim().length > 0 &&
      this.form.houseNumber.trim().length > 0 &&
      this.dayOptions.includes(this.form.assignedDay)
    );
  }

  private createEmptyForm(): AdminForm {
    return {
      name: '',
      phoneNumber: '',
      assignedDay: 'Monday',
      roomNumber: '',
      houseNumber: '',
      isAvailable: true,
    };
  }

  private getAdminIdentity(admin: IAdmin): string {
    return [
      admin.name,
      admin.phoneNumber,
      admin.assignedDay,
      admin.roomNumber,
      admin.houseNumber,
    ].join('|');
  }
}
