import { Component, OnInit} from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HooRank';

  constructor(private appService: AppService) {
    
  }

  ngOnInit() {
    this.appService.setData()
  }





}
