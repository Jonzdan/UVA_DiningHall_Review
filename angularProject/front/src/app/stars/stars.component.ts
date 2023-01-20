import { identifierName } from '@angular/compiler'
import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stars',
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.css']
})
export class StarsComponent implements OnInit {
  public idList:Array<number> = [1,2,3,4,5]
  permRating:number = 0
  tempRating:number = 0
  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  updateStars(i: number) {
    if (i > this.idList.length) { return }
    this.permRating = i
  }
  updateStarsTemp(i:number) {
    if (i > this.idList.length) return
    if (i === 0 && this.permRating !== i) { //clear everything
      this.tempRating = this.permRating
      return
    }
    this.tempRating = i

  }

  getStars():number {
    return this.permRating
  }

}
