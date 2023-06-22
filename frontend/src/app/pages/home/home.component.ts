import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  name: string = '';
  house: string = '';
  room: string = '';
  password: string = '';

  placeholderName: string = 'Name';
  placeholderHouse: string = 'Haus';
  placeholderRoom: string = 'Zimmernummer';
  placeholderPassword: string = 'Passwort';

  userCanSubmit: boolean = false;

  errorLabelText: string = 'Bitte fülle alles aus';

  constructor(private authService: AuthService, private router: Router) {}

  onInputName(e: Event) {
    this.name = (e.target as HTMLInputElement).value;
    this.checkValidity();
  }

  onInputHouse(e: Event) {
    this.house = (e.target as HTMLInputElement).value;
    this.checkValidity();
  }

  onInputRoom(e: Event) {
    this.room = (e.target as HTMLInputElement).value;
    this.checkValidity();
  }

  onInputPassword(e: Event) {
    this.password = (e.target as HTMLInputElement).value;
    this.checkValidity();
  }

  checkValidity() {
    if (
      this.name.length > 0 &&
      this.house.length > 0 &&
      this.room.length > 0 &&
      this.password.length > 0
    ) {
      this.userCanSubmit = true;
    } else {
      this.userCanSubmit = false;
      this.errorLabelText = 'Bitte fülle alles aus';
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
        this.router.navigate(['/booking']); // Navigate to the booking page after successful authentication
      },
      error => {
        console.error('Authentication error:', error);
        // this.errorLabelText = 'Authentication failed. Please check your credentials.';
        this.userCanSubmit = false;
        this.errorLabelText = error.error.error;
      }
    );
  }
}
