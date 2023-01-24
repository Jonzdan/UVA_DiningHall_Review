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
  private runkSet = new Set<string>()
  private ohill!: any
  private ohillSet = new Set<string>()
  private newcomb!: any
  private newcombSet = new Set<string>()
  private datalist!: Array<any>
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

  setData(): void {
    this.call('ohill').subscribe((data) => {this.ohill = data})
    this.call('newcomb').subscribe((data) => { this.newcomb = data})
    this.call('runk').subscribe((data) => { this.runk = data; this.setHeaders()})
  }

  call(target: string) {
    return this.http.get(`http://localhost:4200/api/${target}`).pipe(map((res: any) => res))
  }

  setHeaders(): void {
    let iterator = 0
    this.datalist = [this.runk, this.ohill, this.newcomb]
    for (const diningHall of this.datalist) {
      for (const key in diningHall) {
        if (iterator === 1) { //ohill
          this.ohillSet.add(diningHall[key].stationName)
        }
        else if (iterator === 0) {
          this.runkSet.add(diningHall[key].stationName)
        }
        else {
          this.newcombSet.add(diningHall[key].stationName)
        }
      }
      iterator+=1
    }
    this.setShopToItem()
  
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

  //short version of dininghall is taken in
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
  




