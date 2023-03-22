import { Component, OnInit, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.css']
})
export class SwitchComponent implements OnInit {

  //change this to default angular supported

  /* @ViewChildren('swi')
  public navSwi!: QueryList<ElementRef<HTMLLIElement>>
  @ViewChildren('change')
  public navBtnItems!: QueryList <ElementRef<HTMLLIElement>> */

  name1:string = 'Observatory Hill Dining Hall'; name1Boolean:boolean = true;
  name2:string = 'Newcomb Dining Hall'; name2Boolean:boolean = false;
  name3:string = 'Runk Dining Hall'; name3Boolean: boolean = false;
  public b1: boolean = true
  public b2: boolean = false
  private bgColor = 'bg-[#EB5F0C]'

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() :void {
    
  }
  
  changeData(event: any): void { //add changing colors ** DELETE THIS IN FUTURE, AND JUST ADD NGCLASS CONDITIONALS**
    const name = event.target.innerText
    switch (name) {
      case this.name1: {
        this.name1Boolean = true; this.name2Boolean = false; this.name3Boolean = false;
        break
      }
      case this.name2: {
        this.name2Boolean = true; this.name1Boolean = false; this.name3Boolean = false;
        break
      }
      case this.name3: {
        this.name3Boolean = true; this.name1Boolean = false; this.name2Boolean = false;
        break
      }
      default: {
        console.error(event)
      }
    }

    //also switch data...

    
  }


}
