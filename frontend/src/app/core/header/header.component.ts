import { Component, OnInit } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { Role } from 'src/app/types';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

interface MenuEntry {
  title: string;
  link?: string;
  icon_name: string;
  headerTitle: string;
  onlyAdmin?: boolean;
  onlyMaster?: boolean;
  action: () => void;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private roleSubscription?: Subscription;
  faBars = faBars;
  menuActive = false;
  headerTitle = '';

  userRole: Role = Role.User;

  menuEntries: MenuEntry[] = [
    {
      headerTitle: 'Trag dich ein!',
      title: 'Eintragen',
      link: '/booking',
      icon_name: 'faPencil',
      action: () => {},
    },
    {
      headerTitle: 'Übersicht',
      title: 'Übersicht',
      link: '/overview',
      icon_name: 'faClock',
      action: () => {},
    },
    {
      headerTitle: 'Schlüsselverantwortliche',
      title: 'Schlüssel',
      link: '/admins',
      icon_name: 'faKey',
      action: () => {},
    },
    {
      headerTitle: 'Regeln',
      title: 'Regeln',
      link: '/rules',
      icon_name: 'faBook',
      action: () => {},
    },
    // Admins only
    {
      headerTitle: 'Adminbereich',
      title: 'Adminbereich',
      link: '/admins/edit',
      icon_name: 'faUserShield',
      onlyAdmin: true,
      action: () => {},
    },
    {
      headerTitle: 'Ausloggen',
      title: 'Ausloggen',
      icon_name: 'faRightFromBracket',
      action: () => {
        this.authService.logout();
        window.location.reload();
      },
    },
  ];

  constructor(private router: Router, private authService: AuthService) {
    router.events.subscribe(val => {
      // see also
      // check which router is active
      this.menuEntries.forEach(entry => {
        if (window.location.pathname === entry.link) {
          this.headerTitle = entry.headerTitle;
        }
      });
    });
  }

  ngOnChanges(): void {}

  ngOnInit(): void {
    this.roleSubscription = this.authService.role.subscribe(role => {
      this.userRole = role;
    });
  }

  ngOnDestroy(): void {
    this.roleSubscription?.unsubscribe();
  }

  onToggleMenu() {
    // open burger-menu
    this.menuActive = !this.menuActive;
  }
}
