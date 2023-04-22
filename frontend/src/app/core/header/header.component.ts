import { Component, OnInit } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';

interface MenuEntry {
  title: string;
  link: string;
  icon_name: string;
  headerTitle: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  faBars = faBars;
  menuActive = false;
  headerTitle = '';
  menuEntries: MenuEntry[] = [
    {
      headerTitle: 'Trag dich ein!',
      title: 'Eintragen',
      link: '/booking',
      icon_name: 'faPencil',
    },
    {
      headerTitle: 'Übersicht',
      title: 'Übersicht',
      link: '/overview',
      icon_name: 'faClock',
    },
    {
      headerTitle: 'Schlüsselverantwortliche',
      title: 'Schlüssel',
      link: '/adminslist',
      icon_name: 'faKey',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    // check which router is active
    this.menuEntries.forEach(entry => {
      if (window.location.pathname === entry.link) {
        this.headerTitle = entry.headerTitle;
      }
    });
  }

  onToggleMenu() {
    console.log('toggle menu');
    // open burger-menu
    this.menuActive = !this.menuActive;
  }
}
