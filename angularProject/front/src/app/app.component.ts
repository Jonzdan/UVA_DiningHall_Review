import { Component } from '@angular/core';
import { AppService } from '../app/app.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HooRank';

  constructor(appService: AppService) {
    appService.setData()
  }
}
