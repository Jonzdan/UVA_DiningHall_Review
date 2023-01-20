import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AppReviewService } from '../app-review.service';
import  { map } from 'rxjs'
import { StarsComponent } from '../stars/stars.component';

 interface objectPair {
    [key: string]: any
  } 

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {

  @Input() item!: any
  @Input() short!: string
  @Input() stationName!: string
  @ViewChild(StarsComponent) child!:StarsComponent
  @ViewChildren('dropdown')
  public dropdown!: QueryList<ElementRef<HTMLLIElement>>

  constructor(private appReview: AppReviewService, private elementRef: ElementRef) { 

  }

  ngOnInit(): void {
    //console.log(this.item);
  }

  openReviewBox(e:any): void { //change to supported way
    let target = this.dropdown.first.nativeElement.className
    if (target.indexOf("hidden") != -1) {
      const firstInd = target.indexOf("hidden")
      const secondInd = firstInd + 6
      target = target.slice(0, firstInd) + target.slice(secondInd+1) + " block "
      this.dropdown.first.nativeElement.className = target
    }
    else {
      const firstInd = target.indexOf("block")
      const secondInd = firstInd + 5
      target = target.slice(0, firstInd) + target.slice(secondInd+1) + " hidden "
      this.dropdown.first.nativeElement.className = target
    }

  }

  showReviews(e:any): void {
    console.log("Show reviews:")
    console.log(this.item.itemReview.reviews)
  }

 
  
  //content should be an json object of 1: content 2: itemname 3: stationname: 4: stars 5: 
  async submitReview(e: any) { //add stars

    let content:objectPair = {stationName: this.stationName,item: this.item, diningHall: this.short}
    this.dropdown.forEach((element) => { 
      if (this.dropdown === null || this.dropdown === undefined) { return }
        const temp = element.nativeElement.children
        for (let i = 0; i < temp.length; ++i) {
          switch (temp[i].nodeName) {
            case "APP-STARS":
              if (this.child.getStars() === 0) { return }
              content[temp[i].nodeName] = this.child.getStars()
              break
            case "TEXTAREA":
              if (temp[i]!.textContent!.length <= 120) {
                return
              }
              content["Content"] = temp[i].textContent
              break
          }
         }
         console.log(content)
       })
       let temp = await this.appReview.sendReview(this.short, content)
       temp.subscribe((res) => { console.log(res) })
       //
      //console.log(responseBody)
      //pop a little alert that says thx for submitting
    }
    
    
    
  

  showOptions(e:any):void {
    return
  }


}
