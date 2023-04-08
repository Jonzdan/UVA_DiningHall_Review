import { Component, OnInit, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { SwitchDininghallService } from '../switch-dininghall.service';

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

  public b1: boolean = true
  public b2: boolean = false
  private bgColor = 'bg-[#EB5F0C]'

  constructor(private elementRef: ElementRef, private sds: SwitchDininghallService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() :void {
    
  }
  
  changeData(event: any): void { //add changing colors 
    const name = event.target.innerText
    this.sds.changeData(name)

    //also switch data...
  }

  get name1() { return this.sds.name1}
  get name2() { return this.sds.name2}
  get name3() { return this.sds.name3}
  get name1Boolean() { return this.sds.name1Boolean}
  get name2Boolean() { return this.sds.name2Boolean}
  get name3Boolean() { return this.sds.name3Boolean}


}
