import { Component, OnInit } from '@angular/core';
import { InfoService } from './services/info.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'GPSportPlaner';
  backendIsAlive: boolean = true;
  constructor(
    private infoService: InfoService,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.infoService.checkIfBackendIsAlive();
    this.infoService.getBackendIsAlive().subscribe(backendIsAlive => {
      this.backendIsAlive = backendIsAlive;
    });
  }
  changeOfRoutes() {
    this.checkAndRedirect();
  }

  checkAndRedirect() {
    const expDate = this.authService.getTokenExpirationDate();

    // Check if does not exist or is expired
    if (!expDate || expDate * 1000 - Date.now() < 0) {
      console.log('Token is invalid or does not exist or is expired');
      // logout and redirect to login
      this.authService.clearToken();
      this.router.navigate(['/']);
      // location.reload();
      return;
    }

    const expiresIn = expDate * 1000 - Date.now(); // Convert expDate to milliseconds

    // token is valid for 14 days
    // if the token is older than 3 days, refresh it

    let refreshAt = 11 * 24 * 60 * 60 * 1000; // refresh at 11 days (3 days after issued)

    // console.log('expires in: ', expiresIn / 1000 / 60 / 60 / 24, ' days');
    // console.log('refreshTime days: ', refreshAt / 1000 / 60 / 60 / 24, ' days');
    // console.log(
    //   'expiresIn - refreshTime: ',
    //   (expiresIn - refreshAt) / 1000 / 60 / 60 / 24,
    //   ' days'
    // );

    // check if token is older than 3 days
    if (expiresIn - refreshAt < 0) {
      this.authService.refreshToken().subscribe({
        next: () => {
          console.log('Token refreshed');
        },
        error: error => {
          console.error('Error refreshing token:', error);
          this.authService.clearToken();
          localStorage.clear();
          // redirect to login
          this.router.navigate(['/']);
        },
      });
    }

    // token is not older than 3 days
    else {
      console.log('Token is still valid and not older than 3 days');
      this.authService.initToken();
    }
  }
}
