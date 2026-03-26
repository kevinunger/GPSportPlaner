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

  downloadAdminsOverview(): void {
    if (this.admins.length === 0) {
      return;
    }

    const size = 1080;
    const padding = 64;
    const innerSize = size - padding * 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const tableHeaders = [
      this.translocoService.translate('adminEdit.export.dayColumn'),
      this.translocoService.translate('adminEdit.fields.name'),
      this.translocoService.translate('adminEdit.fields.phoneNumber'),
      this.translocoService.translate('adminEdit.fields.houseNumber'),
      this.translocoService.translate('adminEdit.fields.roomNumber'),
    ];

    const rows = this.admins.map(admin => [
      this.getDayLabel(admin.assignedDay),
      admin.name,
      admin.phoneNumber,
      admin.houseNumber,
      admin.roomNumber,
    ]);

    const availableTableHeight = innerSize;
    const rowHeight = Math.max(
      34,
      Math.min(58, Math.floor(availableTableHeight / (rows.length + 1)))
    );
    const headerRowHeight = rowHeight + 6;
    const fontSize = Math.max(16, Math.min(26, Math.floor(rowHeight * 0.42)));
    const smallFontSize = Math.max(13, fontSize - 3);
    const tableTop = padding;
    const columnFractions = [1.15, 1.75, 1.95, 1.0, 1.0];
    const totalFraction = columnFractions.reduce((sum, current) => sum + current, 0);
    const tableWidth = innerSize;
    const columnWidths = columnFractions.map(value => (tableWidth / totalFraction) * value);

    context.fillStyle = '#f5f8fc';
    context.fillRect(0, 0, size, size);

    this.fillRoundedRect(context, padding, tableTop, tableWidth, headerRowHeight, 20, '#e8f0fb');

    let currentX = padding;
    context.fillStyle = '#203247';
    context.font = `800 ${smallFontSize}px Nunito, sans-serif`;
    context.textBaseline = 'middle';
    tableHeaders.forEach((header, index) => {
      context.fillText(header, currentX + 18, tableTop + headerRowHeight / 2 + 1, columnWidths[index] - 28);
      currentX += columnWidths[index];
    });

    rows.forEach((row, rowIndex) => {
      const rowTop = tableTop + headerRowHeight + rowIndex * rowHeight;
      const background =
        rowIndex % 2 === 0 ? 'rgba(255, 255, 255, 0.94)' : 'rgba(244, 248, 253, 0.94)';
      this.fillRoundedRect(context, padding, rowTop, tableWidth, rowHeight - 4, 16, background);

      let rowX = padding;
      context.fillStyle = '#1d2f45';
      context.font = `${rowIndex === 0 ? 700 : 600} ${fontSize}px Nunito, sans-serif`;
      row.forEach((cell, cellIndex) => {
        context.fillText(
          String(cell),
          rowX + 18,
          rowTop + (rowHeight - 4) / 2 + 1,
          columnWidths[cellIndex] - 28
        );
        rowX += columnWidths[cellIndex];
      });

      const nextRow = rows[rowIndex + 1];
      if (nextRow && row[0] !== nextRow[0]) {
        const dividerY = rowTop + rowHeight + 10;
        context.beginPath();
        context.moveTo(padding + 8, dividerY);
        context.lineTo(padding + tableWidth - 8, dividerY);
        context.strokeStyle = 'rgba(42, 106, 199, 0.22)';
        context.lineWidth = 3;
        context.stroke();
      }
    });

    canvas.toBlob(blob => {
      if (!blob) {
        return;
      }

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `gps-admins-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
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
    const confirmed = window.confirm(
      this.translocoService.translate('adminEdit.deleteConfirm', {
        name: admin.name,
      })
    );
    if (!confirmed) {
      return;
    }
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

  private fillRoundedRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: string
  ): void {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
  }
}
