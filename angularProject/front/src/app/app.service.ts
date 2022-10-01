import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private http: HttpClient) { }

  private runk!: any
  private runkSet!: Set<string>
  private ohill!: any
  private ohillSet!: Set<string>
  private newcomb!: any
  private newcombSet!: Set<string>
  private datalist = [this.runk, this.ohill, this.newcomb]
  private runkShopToItems: any = {}
  private ohillShopToItems: any = {}
  private newcombShopToItems: any = {}

  getData(target:string) {
    if (target === 'runk') {
      return this.runk
    }
    else if (target === 'ohill') {
      return this.ohill
    }
    else {
      return this.newcomb
    }
  }

  setData():void {
    this.http.get(`http://localhost:4200/api/runk`).pipe(map((res: any) => this.runk = JSON.parse(res)))
    this.http.get(`http://localhost:4200/api/ohill`).pipe(map((res: any) => this.ohill = JSON.parse(res) ))
    this.http.get(`http://localhost:4200/api/newcomb`).pipe(map((res: any) => {
      this.newcomb = JSON.parse(res)
      this.setHeaders()
    }))
  }

  setHeaders(): void {
    let iterator = 0
    for (const diningHall of this.datalist) {
      for (const key in diningHall) {
        if (iterator === 0) { //runk
          this.runkSet.add(diningHall[key].stationName)
        }
        else if (iterator === 1) {
          this.ohillSet.add(diningHall[key].stationName)
        }
        else {
          this.newcombSet.add(diningHall[key].stationName)
        }
      }
      iterator+=1
    }
  
  } 

  getHeaders(target:string) {
    if (target === 'runk') {
      return this.runkSet
    }
    else if (target === 'ohill') {
      return this.ohillSet
    }
    else {
      return this.newcombSet
    }
  }

  setShopToItem(): void {
    let l = [this.runkSet, this.ohillSet, this.newcombSet]
    for (let i = 0; i < l.length; i++) {
      for (const elem of l[i].values()) {
        if (i === 0) {
          if (!(elem in this.runkShopToItems)) {
            this.runkShopToItems[elem] = []
          }
        }
        else if (i === 1) {
          if (!(elem in this.ohillShopToItems)) {
            this.ohillShopToItems[elem] = []
          }
        }
        else {
          if (!(elem in this.newcombShopToItems)) {
            this.newcombShopToItems[elem] = []
          }
        }
        
    }
    }
    for (let i = 0; i < this.datalist.length; i++) {
      for (const key in this.datalist[i]) {
        if (i === 0) {
          if (this.datalist[i][key].stationName in this.runkShopToItems) {
            this.runkShopToItems[this.datalist[i][key].stationName].push(this.datalist[i][key].item)
          }
        }
        else if (i === 1) {
          if (this.datalist[i][key].stationName in this.ohillShopToItems) {
            this.ohillShopToItems[this.datalist[i][key].stationName].push(this.datalist[i][key].item)
          }
        }
        else {
          if (this.datalist[i][key].stationName in this.newcombShopToItems) {
            this.newcombShopToItems[this.datalist[i][key].stationName].push(this.datalist[i][key].item)
          }
        }
    }
    }
    
  }

  getShopToItem(target:string) {
    if (target === 'runk') {
      return this.runkShopToItems
    }
    else if (target === 'newcomb') {
      return this.newcombShopToItems
    }
    else {
      return this.ohillShopToItems
    }
  }
}
  




