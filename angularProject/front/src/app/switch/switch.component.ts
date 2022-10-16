import { Component, OnInit, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';

type NewType = ElementRef;

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.css']
})
export class SwitchComponent implements OnInit {

  @ViewChildren('change')
  public navBtnItems!: QueryList <ElementRef<HTMLLIElement>>

  public name1:string = 'Observatory Hill Dining Hall'
  public name2:string = 'Newcomb Dining Hall'
  public name3:string = 'Runk Dining Hall'
  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() :void {
  }
  
  changeData(event: any): void {
    let name = event.target.textContent
    name = name.trim()
    for (let child of this.navBtnItems) {
      let children: HTMLCollection = child.nativeElement.children
      if (name === 'Newcomb Dining Hall') {
        children[2].className = 'flex'
        children[1].className = 'hidden'
        children[0].className = 'hidden'
      }
      else if (name === 'Observatory Hill Dining Hall') {
        children[0].className = 'flex'
        children[1].className = 'hidden'
        children[2].className = 'hidden'
      }
      else {
        children[1].className = 'flex'
        children[2].className = 'hidden'
        children[0].className = 'hidden'
      }
    }

    
  }


}
