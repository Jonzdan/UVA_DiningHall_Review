import { Component, Input, OnInit, AfterViewInit, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { AppService} from '../app.service'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-dininghall',
  templateUrl: './dininghall.component.html',
  styleUrls: ['./dininghall.component.css']
})

export class DininghallComponent implements OnInit, AfterViewInit {

  @Input() text!: string
  @Input() show?: string
  @Input() short!: string
  headers: any


  constructor(private elementRef: ElementRef, private appService: AppService) {

   }

  ngOnInit(): void {
     //thi
    this.headers = this.appService.getHeaders(this.short)
    
  }


  ngAfterViewInit(): void {
    //this.elementRef.nativeElement.querySelector("div > h2").addEventListener('click', this.changeStyling.bind(this))
  }

  //create interface that simulates runk/ohill/newcomb dining data api fetch content

  


}
