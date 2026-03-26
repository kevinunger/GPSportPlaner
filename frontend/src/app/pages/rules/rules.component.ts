import { Component, OnInit } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-rules',
  standalone: false,
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
})
export class RulesComponent implements OnInit {
  constructor(private translocoService: TranslocoService) {}

  ngOnInit(): void {}
}
