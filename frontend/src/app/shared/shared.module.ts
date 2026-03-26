import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { ButtonComponent } from './button/button.component';
import { TextInputComponent } from './text-input/text-input.component';

@NgModule({
  imports: [CommonModule, CheckboxComponent, ButtonComponent, TextInputComponent],
  exports: [CheckboxComponent, ButtonComponent, TextInputComponent],
})
export class SharedModule {}
