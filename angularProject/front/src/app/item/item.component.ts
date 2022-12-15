import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AppReviewService } from '../app-review.service';
import  { map } from 'rxjs'

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {

  @Input() item!: any
  @Input() short!: string
  @ViewChild('reviewBox') r!: ElementRef
  @ViewChildren('dropdown')
  public dropdown!: QueryList<ElementRef<HTMLLIElement>>

  constructor(private appReview: AppReviewService, private elementRef: ElementRef) { 

  }

  ngOnInit(): void {
    //console.log(this.item);
  }

  openReviewBox(e:any): void {
    let target = this.dropdown.first.nativeElement.className
    if (target.indexOf("hidden") != -1) {
      const firstInd = target.indexOf("hidden")
      const secondInd = firstInd + 6
      target = target.slice(0, firstInd) + target.slice(secondInd)+1 + " relative "
      this.dropdown.first.nativeElement.className = target
    }
    else {
      const firstInd = target.indexOf("relative")
      const secondInd = firstInd + 8
      target = target.slice(0, firstInd) + target.slice(secondInd)+1 + " hidden "
      this.dropdown.first.nativeElement.className = target
    }

  }

  showReviews(e:any): void {
    console.log("Show reviews:")
    console.log(this.item.itemReview.reviews)
  }

  async submitReview(e: any) { //add stars
    let content:any = this.r.nativeElement.value
    let newObj = { item: this.item, content: content}
    let temp = await this.appReview.sendReview(this.short, newObj)
    temp.subscribe((res) => { console.log(res) })
    this.r.nativeElement.value = ""
    //console.log(responseBody)
    //pop a little alert that says thx for submitting
    
  }


}
