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

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() :void {
  }
  
  changeData(event: any): void {
    let name = event.target.textContent
    for (let child of this.navBtnItems) {
      let children: HTMLCollection = child.nativeElement.children
      for (let i = 0; i < children.length; i++) {
        let old:string | null = children[i].getAttribute('style')
        old = this.replaceDisplay(old)
        if (children[i].querySelector("div > h2")?.textContent === name) {
          children[i].setAttribute('style', old + 'display: block;')

        }
        else {
          children[i].setAttribute('style', old + 'display: none;')
        }
      }
    }

    
  }

  replaceDisplay(s:string | null): string{
    if (s == null) {
      return ''
    }
    if (s != null && s.indexOf('display:') != -1) {
      let end = s.indexOf('display:') + 8
      let end1 = s.indexOf(';', end) + 1
      s = s.slice(0,s.indexOf('display:')) + s.slice(end1)
    }
    return s
  }

}
