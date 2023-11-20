import { Component, OnInit } from '@angular/core';
import { faBars, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { Role } from 'src/app/types';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';
import { SettingsService } from 'src/app/services/settings.service';

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
  faLanguage = faLanguage;

  menuActive = false;
  headerTitle = '';

  userRole: Role = Role.User;

  activeLang = '';
  availableLangs: string[] = [];

  menuEntries: MenuEntry[] = [
    {
      headerTitle: 'menu.bookingHeaderTitle',
      title: 'menu.bookingTitle',
      link: '/booking',
      icon_name: 'faPencil',
      action: () => {},
    },
    {
      headerTitle: 'menu.overviewTitle',
      title: 'menu.overviewTitle',
      link: '/overview',
      icon_name: 'faClock',
      action: () => {},
    },
    {
      headerTitle: 'menu.adminsHeaderTitle',
      title: 'menu.adminsTitle',
      link: '/admins',
      icon_name: 'faKey',
      action: () => {},
    },
    {
      headerTitle: 'menu.rulesHeaderTitle',
      title: 'menu.rulesTitle',
      link: '/rules',
      icon_name: 'faClipboardList',
      action: () => {},
    },
    // Admins only
    {
      headerTitle: 'menu.adminAreaHeaderTitle',
      title: 'menu.adminAreaTitle',
      link: '/admins/edit',
      icon_name: 'faUserShield',
      onlyAdmin: true,
      action: () => {},
    },
    {
      headerTitle: 'menu.logoutHeaderTitle',
      title: 'menu.logoutTitle',
      icon_name: 'faRightFromBracket',
      action: () => {
        this.authService.logout();
        window.location.reload();
      },
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private translocoService: TranslocoService,
    private settingsService: SettingsService
  ) {
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
    this.activeLang = this.translocoService.getActiveLang();
    this.availableLangs = this.translocoService.getAvailableLangs() as string[];

    this.translocoService.selectTranslate('menu.bookingHeaderTitle').subscribe({
      next: () => {
        console.log(this.translocoService.translate('menu.bookingHeaderTitle'));
        this.applyTranslations();
      },
    });
  }
  applyTranslations() {
    this.menuEntries = this.menuEntries.map(entry => ({
      ...entry,
      title: this.translocoService.translate(entry.title),
      headerTitle: this.translocoService.translate(entry.headerTitle),
    }));
  }
  ngOnDestroy(): void {
    this.roleSubscription?.unsubscribe();
  }

  onToggleMenu() {
    if (this.authService.getToken()) {
      this.menuActive = !this.menuActive;
    }
  }
  onLanguageChange() {
    this.settingsService.setLanguage(this.activeLang);
    this.translocoService.setActiveLang(this.activeLang);
    window.location.reload();
  }
}
