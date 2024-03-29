import { Component, OnInit, Input } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

// load all icons
import {
  faPencil,
  faClock,
  faKey,
  IconDefinition,
  faUserShield,
  faRightFromBracket,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';

const iconMap: Record<string, IconDefinition> = {
  faPencil: faPencil,
  faClock: faClock,
  faKey: faKey,
  faUserShield: faUserShield,
  faRightFromBracket: faRightFromBracket,
  faClipboardList: faClipboardList,
};

@Component({
  selector: 'app-menu-entry',
  templateUrl: './menu-entry.component.html',
  styleUrls: ['./menu-entry.component.scss'],
})
export class MenuEntryComponent implements OnInit {
  @Input() title: string = '';
  @Input() link?: string = '';
  @Input() icon_name: string = '';
  @Input() action: () => void = () => {};
  icon: IconProp = faPencil;

  constructor() {}

  ngOnInit(): void {
    this.icon = iconMap[this.icon_name] || faPencil;
  }

  onClick(): void {
    this.action();
  }
}
