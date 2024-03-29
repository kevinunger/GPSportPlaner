import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { TranslocoService } from '@ngneat/transloco';

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

  userCanSubmit: boolean = false;
  errorLabelText: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      console.log('Token exists');
      this.router.navigate(['/booking']);
    }
  }

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
      this.errorLabelText = this.translocoService.translate('home.errorLabelText');
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
        console.log('Authentication successful');
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
