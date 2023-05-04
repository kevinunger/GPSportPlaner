import { Component, OnInit } from '@angular/core';
import { InfoService } from './services/info.service';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'GPSportPlaner';
  backendIsAlive: boolean = true;
  constructor(private infoService: InfoService, private authService: AuthService) {}
  ngOnInit(): void {
    this.infoService.checkIfBackendIsAlive();
    this.infoService.getBackendIsAlive().subscribe(backendIsAlive => {
      this.backendIsAlive = backendIsAlive;
    });

    // init jwt
    this.authService.initToken();
  }
}
