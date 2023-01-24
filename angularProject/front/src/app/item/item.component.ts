import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AppReviewService } from '../app-review.service';
import  { map } from 'rxjs'
import { StarsComponent } from '../stars/stars.component';
import { AppService } from '../app.service';

 interface objectPair {
    [key: string]: any
  } 

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {

  @Input() short!: string
  @Input() stationName!: string
  @Input() indicator!: number
  @ViewChild(StarsComponent) child!:StarsComponent
  textContent:string = ""
  numStars:number = 0
  openOrNot:boolean = false
  public item!: any 

  constructor(private appReview: AppReviewService, private elementRef: ElementRef, private appService: AppService) { 

  }

  ngOnInit(): void {
    this.item = this.appService.getShopToItem(this.short)[this.stationName][this.indicator]
  }

  openReviewBox(e:any): void { //change to supported way
    this.openOrNot = !this.openOrNot
  }

  showReviews(e:any): void {
  }

  updateStars(e:any): void {
    if (e.target.id <= 0 || e.target.id > 5) return
    this.numStars = e.target.id
  }

  textArea(e:any):void {
    this.textContent = e.target.value
  }

  sumOfStars(starArr:any):number {
    let count = 0
    for(let i = 0; i < starArr.length; i++) {
      count += parseInt(starArr[i])
    }
    return Number((count/starArr.length).toFixed(3))
  }


  
  //content should be an json object of 1: content 2: itemname 3: stationname: 4: stars 5: 
  async submitReview(e: any) { //add stars
    let content:objectPair = {stationName: this.stationName, itemName: this.item.itemName,itemDesc: this.item.itemDesc, "Content": this.textContent, "APP-STARS": this.numStars}
    if (content["Content"] === null || content["Content"] === undefined || content["Content"].length < 50) {  //put pop-up showcasing limit
      alert("Msg too short!") //temporary
      return
    }
    if (content["APP-STARS"] > 5 || content["APP-STARS"] <= 0) {
      alert("Invalid Star Range") //temp
      return
    }
    let temp = await this.appReview.sendReview(this.short, content) //add spinner while loading
    temp.subscribe((res) => { console.log(res) })
       //
      //console.log(responseBody)
      //pop a little alert that says thx for submitting
    }
    
    
    
  

  showOptions(e:any):void {
    return
  }


}
