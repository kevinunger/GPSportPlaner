import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  name: string = '';
  house: string = '';
  room: string = '';
  password: string = '';

  placeholderName: string = 'Name';
  placeholderHouse: string = 'House';
  placeholderRoom: string = 'Room';
  placeholderPassword: string = 'Password';

  userCanSubmit: boolean = false;

  errorLabelText: string = 'Please fill in all fields';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkAndRedirect();
  }

  checkAndRedirect() {
    const expiresIn = this.authService.getTokenExpirationDate();
    if (expiresIn) {
      console.log('expiresIn: ' + expiresIn + ' seconds');
      // in days
      console.log('expiresIn: ' + expiresIn / 60 / 60 / 24 + ' days');

      if (expiresIn >= 0) {
        if (expiresIn >= 1.5 * 7 * 24 * 60 * 60) {
          // 1.5 weeks
          this.router.navigate(['/booking']);
        } else {
          // Get a new token from the backend and then redirect
          this.authService.refreshToken().subscribe(
            () => {
              this.router.navigate(['/booking']);
            },
            error => {
              console.error('Error refreshing token:', error);
              this.authService.clearToken();
              localStorage.clear();
              location.reload();
            }
          );
        }
      }
    }
  }

  onInputName(e: Event) {
    // console.log((e.target as HTMLInputElement).value);
    this.name = (e.target as HTMLInputElement).value;
    this.checkValidity();
  }

  onInputHouse(e: Event) {
    console.log((e.target as HTMLInputElement).value);
    this.house = (e.target as HTMLInputElement).value;
    this.checkValidity();
  }

  onInputRoom(e: Event) {
    console.log((e.target as HTMLInputElement).value);
    this.room = (e.target as HTMLInputElement).value;
    this.checkValidity();
  }

  onInputPassword(e: Event) {
    console.log((e.target as HTMLInputElement).value);
    this.password = (e.target as HTMLInputElement).value;
    this.checkValidity();
  }

  checkValidity() {
    if (this.name.length > 0 && this.house.length > 0 && this.room.length > 0 && this.password.length > 0) {
      this.userCanSubmit = true;
    } else {
      this.userCanSubmit = false;
      this.errorLabelText = 'Please fill in all fields';
    }
  }

  onSubmit() {
    const loginData = {
      name: this.name,
      house: this.house,
      room: this.room,
      password: this.password,
    };

    this.authService.authenticate(loginData).subscribe(
      jwtToken => {
        console.log('Authenticated with token:', jwtToken);
        this.router.navigate(['/booking']); // Navigate to the booking page after successful authentication
      },
      error => {
        console.log('Authentication error:', error);
        // this.errorLabelText = 'Authentication failed. Please check your credentials.';
        this.userCanSubmit = false;
        this.errorLabelText = error.error.error;
      }
    );
  }
}
