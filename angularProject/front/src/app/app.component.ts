import { Component, OnInit} from '@angular/core';
import { AppService } from './app.service';
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HooRank';

  constructor(private appService: AppService, private authentication: AuthenticationService) {
    
  }

  ngOnInit() {
    this.appService.setData()
    this.authentication.getCSRF()
  }





}
