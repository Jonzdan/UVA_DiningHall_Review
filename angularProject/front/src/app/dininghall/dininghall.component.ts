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
  //placeholder, but its the data from later..
  //listOfItems!: Array<ItemComponent>;
  @Input() apiCall!: string
  @Input() show?: string
  @Input() short!: string
  data!: any
  stringVersion!: string;
  headers: Set<string> = new Set()


  constructor(private elementRef: ElementRef, public appService: AppService) {

   }

  ngOnInit(): void {
    if (this.show != 'hidden') {
      this.appService.getData(this.short).subscribe((res: string) => {
        this.stringVersion = res
        this.data = JSON.parse(res)
        this.setHeaders()

      }) //thi
    }
  }


  ngAfterViewInit(): void {
    this.elementRef.nativeElement.querySelector("div > h2").addEventListener('click', this.changeStyling.bind(this))
    //const b = document.querySelector(`#${this.short}`)?.setAttribute('style', 'display: hidden;')
  }

  //create interface that simulates runk/ohill/newcomb dining data api fetch content
  setHeaders(): void {
      for (const key in this.data) {
        this.headers.add(this.data[key].stationName)
      }
    
  } 


  changeStyling(e:any): void {
    console.log(e.target.parentNode)
    const oldAttr = e.target.parentNode.getAttribute('style')
    let temp:string = this.replaceDisplay(oldAttr)
    console.log(temp)
    e.target.parentNode.setAttribute('style', temp + ' display: none;')

  }

  replaceDisplay(s:string): string{
    if (s == null) {
      return ''
    }
    console.log(s)
    if (s != null && s.indexOf('display:') != -1) {
      let end = s.indexOf('display:') + 8
      let end1 = s.indexOf(';', end) + 1
      s = s.slice(0,s.indexOf('display:')) + s.slice(end1)
    }
    return s
  }


}
