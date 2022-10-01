import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-station-name',
  templateUrl: './station-name.component.html',
  styleUrls: ['./station-name.component.css']
})
export class StationNameComponent implements OnInit {

  @Input() short!: string
  shopToItems: any = {}
  headers: any

  constructor(private appService: AppService) { }

  ngOnInit(): void {
      this.shopToItems = this.appService.getShopToItem(this.short)
      this.headers = this.appService.getHeaders(this.short)
    }
    
    
  

  ngAfterViewInit(): void {
  }

  

}
