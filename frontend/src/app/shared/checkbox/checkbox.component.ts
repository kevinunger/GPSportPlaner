import { Component, OnInit, Input } from '@angular/core';

type CheckedState = 'checked' | 'unchecked' | 'indeterminate';

interface ICheckbox {
  editale: boolean;
  checkedState: boolean;
}

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent implements OnInit {
  @Input() disabled: boolean = true;
  @Input() checked: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
