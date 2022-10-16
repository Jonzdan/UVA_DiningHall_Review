import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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

  constructor(private appReview: AppReviewService, private elementRef: ElementRef) { 

  }

  ngOnInit(): void {
    //console.log(this.item);
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
