import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, retry, map, last } from 'rxjs/operators';

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
  private runkShopToItems: any = {}
  private ohillShopToItems: any = {}
  private newcombShopToItems: any = {}
  private _dataLoaded:BehaviorSubject<boolean> = new BehaviorSubject(false);
  private ohillDone:boolean = false; private newcombDone:boolean = false; private runkDone:boolean = false;


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
    this.call('ohill').pipe(
      last(),
      catchError((err, caught) => {
        this.ohillDone = true;
        setTimeout(() => {
          this._dataLoaded.next(this.newcombDone && this.ohillDone && this.runkDone)
        }, 400);
        throw err
    })).subscribe((data) => {this.ohill = data; this.setHeaders("ohill")})
    this.call('newcomb').pipe(
      last(),
      catchError((err, caught) => {
        this.newcombDone = true;
        setTimeout(() => {
          this._dataLoaded.next(this.newcombDone && this.ohillDone && this.runkDone)
        }, 400);
        throw err
    })).subscribe((data) => { this.newcomb = data; this.setHeaders("newcomb")})
    this.call('runk').pipe(
      last(),
      catchError((err, caught) => {
        this.runkDone = true;
        setTimeout(() => {
          this._dataLoaded.next(this.newcombDone && this.ohillDone && this.runkDone)
        }, 400);
        throw err
    })).subscribe((data) => { this.runk = data; this.setHeaders("runk")})
  }

  private call(target: string) {
    return this.http.get(`http://localhost:4200/api/${target}`).pipe(map((res: any) => res))
  }

  private headerHelper(target:string):any {
    switch (target) {
      case "ohill": {
        return this.ohill
      }
      case "newcomb": {
        return this.newcomb
      }
      case "runk": {
        return this.runk
      }
      default: {
        return "?????"
      }
    }
  }

  private setHeaders(target:string): void {
    let diningHall = this.headerHelper(target)
    if (diningHall === "?????") {return}
    for (const key in diningHall) {
      if (target === 'ohill') { //ohill
        this.ohillSet.add(diningHall[key].stationName)
      }
      else if (target === "runk") {
        this.runkSet.add(diningHall[key].stationName)
      }
      else if (target === "newcomb") {
        this.newcombSet.add(diningHall[key].stationName)
      }
    }
    this.setShopToItem(target)
  
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

  private shopHelper(target:string):Set<any> {
    switch (target) {
      case "ohill": {
        return this.ohillSet
      }
      case "newcomb": {
        return this.newcombSet
      }
      case "runk": {
        return this.runkSet
      }
      default: {
        return new Set()
      }
    }
  }

  private setShopToItem(target:string): void {
    let l = this.shopHelper(target).values()

      for (const elem of l) { //load only 4 items, before then moving on (lazy load others) ; also add loading animation
        switch (target) {
          case "ohill": {
            if (!(elem in this.ohillShopToItems)) {
              this.ohillShopToItems[elem] = []
            }
            break
          }
          case "newcomb": {
            if (!(elem in this.newcombShopToItems)) {
              this.newcombShopToItems[elem] = []
            }
            break
          }
          case "runk": {
            if (!(elem in this.runkShopToItems)) {
              this.runkShopToItems[elem] = []
            }
            break
          }
        }
        
    }
    let diningHall = this.headerHelper(target)
    for (const key in diningHall) {
      if (target === "runk") {
        if (diningHall[key].stationName in this.runkShopToItems) {
          this.runkShopToItems[diningHall[key].stationName].push(diningHall[key].item)
        }
      }
      else if (target === "ohill") {
        if (diningHall[key].stationName in this.ohillShopToItems) {
          this.ohillShopToItems[diningHall[key].stationName].push(diningHall[key].item)
        }
      }
      else if (target === "newcomb") {
        if (diningHall[key].stationName in this.newcombShopToItems) {
          this.newcombShopToItems[diningHall[key].stationName].push(diningHall[key].item)
        }
      }
    }
    console.log(1)
    this.sortItems(target, ()=> {
      switch (target) {
        case "ohill": {
          for (const elem of Object.keys(this.ohillShopToItems)) {
            this.ohillShopToItems[elem].sort(function(a:itemObject,b:itemObject){return (b.itemName.length + b.itemDesc.length) - (a.itemName.length + a.itemDesc.length)})
          }
          this.ohillDone = true;
          break
        }
        case "runk": {
          this.runkDone = true;
          break
        }
        case "newcomb": {
          this.newcombDone = true;
          break
        }
      }
      if (this.newcombDone && this.runkDone && this.ohillDone) {
        this._dataLoaded.next(true)
      }
    })
  }

  private async sortItems(target:string, callback:Function) {
    callback()
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

  get dataLoaded() { return this._dataLoaded }

}

interface itemObject {
  itemDesc:string,
  itemName:string,
  itemReview:object,
  timeFrame:string
}
  




