import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-adminslot',
  templateUrl: './adminslot.component.html',
  styleUrls: ['./adminslot.component.scss'],
})
export class AdminslotComponent implements OnInit {
  @Input() name: String = '';
  @Input() phoneNumber: String = '';
  @Input() isAvailable: Boolean = true;
  @Input() roomNumber: String = '';
  @Input() houseNumber: String = '';

  whatsAppLink: String = '';
  message: String = '';

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges() {
    this.whatsAppLink = 'https://wa.me/' + this.phoneNumber;
  }

  buildURLEncodedMessage(text: String): String {
    return encodeURIComponent(text.toString());
  }

  onClickBtn() {}
}
