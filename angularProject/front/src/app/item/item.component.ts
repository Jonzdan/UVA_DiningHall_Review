import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {

  @Input() item!: any
  @Input() short!: string
  @Input() head!: any


  constructor() { 

  }

  ngOnInit(): void {
    //console.log(this.item)
    //console.log(this.item.stationId)
    if (this.short == 'ohill') {
      this.removeOhillShortDescription()
    }
    
    if (this.short !== 'runk') {
      //stationId

    }
    else {
    }
  }

  removeOhillShortDescription(): void {
    if (this.item.ShortDescription != undefined && this.item.ShortDescription.indexOf("ShortDescription") != -1) {
      let first = this.item.ShortDescription.indexOf("ShortDescription")
      this.item.ShortDescription = this.item.ShortDescription.slice(0, first) + this.item.ShortDescription.slice(first+19)
    }
  }

}
