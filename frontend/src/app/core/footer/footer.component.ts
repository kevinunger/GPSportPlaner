import { Component, OnInit } from '@angular/core';
import { faKey, faClock, faPencil } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor() {}
  faKey = faKey;
  faClock = faClock;
  faPencil = faPencil;

  ngOnInit(): void {}
}
