import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
})
export class TextInputComponent implements OnInit {
  @Input() disabled: boolean = false;
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() type: string = 'text';
  @Input() name: string = '';

  constructor() {}

  ngOnInit(): void {}

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
  }
}
