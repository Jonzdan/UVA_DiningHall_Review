import { Component, OnInit} from '@angular/core';
import { AccountService } from './account.service';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HooRank';

  constructor(private appService: AppService, private as: AccountService) {
    
  }

  ngOnInit() {
    this.appService.setData()
    this.as.authBeginning()
  }





}
