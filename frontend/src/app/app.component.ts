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

    // init jwt
    this.authService.initToken();
    this.checkAndRedirect();
  }
  changeOfRoutes() {
    this.checkAndRedirect();
  }

  checkAndRedirect() {
    const expDate = this.authService.getTokenExpirationDate();
    // If there is no or the token is invalid, exit the function
    if (expDate === null) {
      console.log('Token is invalid or does not exist');
      // logout and reditect to login
      this.authService.clearToken();
      localStorage.clear();
      // location.reload();

      return;
    }

    const expiresIn = expDate * 1000 - Date.now(); // Convert expDate to milliseconds
    console.log('expDate - Date.now()', new Date(expDate * 1000), ' ', Date.now());
    console.log('expiresIn:', expiresIn);

    if (expiresIn >= 1.5 * 7 * 24 * 60 * 60 * 1000) {
      console.log('Token is still valid');
      // Token is still valid for more than 1.5 weeks
      this.authService.initToken();
      // this.router.navigate(['/booking']);
    }
    // Token is expired or will expire within 1.5 weeks
    else {
      console.log('Token is expired');
      // Get a new token from the backend and then redirect
      this.authService
        .refreshToken()
        .pipe(switchMap(() => this.router.navigate(['/booking'])))
        .subscribe({
          next: () => {},
          error: error => {
            console.error('Error refreshing token:', error);
            this.authService.clearToken();
            localStorage.clear();
            location.reload();
          },
        });
    }
  }
}
