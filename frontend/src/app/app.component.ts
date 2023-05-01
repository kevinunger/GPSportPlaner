import { Component, OnInit } from '@angular/core';
import { InfoService } from './services/info.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'GPSportPlaner';
  backendIsAlive: boolean = true;
  constructor(private infoService: InfoService) {}
  ngOnInit(): void {
    this.infoService.checkIfBackendIsAlive();
    this.infoService.getBackendIsAlive().subscribe(backendIsAlive => {
      this.backendIsAlive = backendIsAlive;
    });
  }
}
