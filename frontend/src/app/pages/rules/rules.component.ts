import { Component, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
})
export class RulesComponent implements OnInit {
  constructor(private translocoService: TranslocoService) {}

  ngOnInit(): void {
    console.log('RulesComponent');
    this.translocoService.selectTranslate('rules').subscribe(value => console.log(value));
  }
}
