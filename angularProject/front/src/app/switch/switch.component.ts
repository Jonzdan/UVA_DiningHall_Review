import { Component, OnInit, ElementRef, AfterViewInit, ViewChildren, QueryList } from '@angular/core';

type NewType = ElementRef;

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.css']
})
export class SwitchComponent implements OnInit {

  @ViewChildren('swi')
  public navSwi!: QueryList<ElementRef<HTMLLIElement>>
  @ViewChildren('change')
  public navBtnItems!: QueryList <ElementRef<HTMLLIElement>>

  public name1:string = 'Observatory Hill Dining Hall'
  public name2:string = 'Newcomb Dining Hall'
  public name3:string = 'Runk Dining Hall'
  public b1: boolean = true
  public b2: boolean = false
  private bgColor = 'bg-slate-400'
  private bgEdges = 'rounded-full'

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() :void {
    
  }
  
  changeData(event: any): void { //add changing colors
    let name = event.target.textContent
    name = name.trim()
    let classes = event.target.className
    if (classes.indexOf(this.bgColor) === -1) {
      event.target.className = classes + " " + this.bgColor + " " + this.bgEdges + " " 
    }
    for (let child of this.navSwi) {
      let children: HTMLCollection = child.nativeElement.children //finish thisup
      for (let i = 0; i < children.length; i++) {
        let c = children[i]
        while (c.firstElementChild != null) {
          c = c.firstElementChild
        }
        let tempClass = c.textContent?.trim()
        if (tempClass !== name) {
          let ind = c.className.indexOf(this.bgEdges)
          if (ind !== -1) {
            c.className = c.className.slice(0, ind) + c.className.slice(ind+this.bgEdges.length)
            ind = c.className.indexOf(this.bgColor)
            c.className = c.className.slice(0, ind) + c.className.slice(ind+this.bgColor.length)
          }
        }
      }
      
    }
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
