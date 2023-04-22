import { Component, OnInit, Input } from '@angular/core';

type CheckedState = 'checked' | 'unchecked' | 'indeterminate';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent implements OnInit {
  @Input() disabled: boolean = false;
  @Input() checked: boolean = false;
  @Input() tooltipText: string = '';

  constructor() {}

  ngOnInit(): void {}
}
