import { DiningHallsEnum, NEWCOMB_API, OHILL_API, ROUTES, RUNK_API, type DiningHalls, type FoodItemInput, type FoodItemOutput, type StationFoodItemOutputs } from 'hoorank-shared';
import type { DiningHallStations, HttpMethod, ShopItems, Station, StationNames } from './types';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { initDiningHallStation } from './utils';
import { timeout } from 'rxjs/operators';

@Injectable()
export class FoodService {
    private diningHalls: DiningHallStations;
    private isDataSet: BehaviorSubject<{ target: DiningHalls, result: boolean }>;

    constructor(private http: HttpClient) {
        this.diningHalls = {
            runk: initDiningHallStation(DiningHallsEnum.Runk),
            ohill: initDiningHallStation(DiningHallsEnum.Ohill),
            newcomb: initDiningHallStation(DiningHallsEnum.Newcomb)
        };

        this.isDataSet = new BehaviorSubject<{ target: DiningHalls, result: boolean }>({
            target: DiningHallsEnum.Ohill,
            result: false
        });
    }

    public async initialize(): Promise<void> {
        if (this.isDataLoaded()) {
            return;
        }
        await this.retrieveData();
    }

    private getHttpCall<T>(method: HttpMethod, route: string, body?: T): Observable<T> {
        switch (method) {
            case 'GET': 
                return this.http.get<T>(route);
            case 'POST':
                return this.http.post<T>(route, body);
            case 'PUT':
                return this.http.put<T>(route, body);
        }
    }

    private async fetch<T>(target: DiningHalls, method: HttpMethod, content?: T): Promise<T> {
        let route: string = '';

        switch (target) {
            case DiningHallsEnum.Newcomb:
                route = ROUTES.API.NEWCOMB;
                break;
            case DiningHallsEnum.Ohill:
                route = ROUTES.API.OHILL;
                break;
            case DiningHallsEnum.Runk:
                route = ROUTES.API.RUNK;
                break;
            default:
                throw new Error('Unknown api fetch target');
        }
        
        return firstValueFrom(
            this.getHttpCall<T>(method, route, content)
            .pipe(
                timeout(5000)
            )
        );
    }

    private async retrieveData(): Promise<void> {
        const fetchData = async(hallId: DiningHalls) => {
            const data = await this.fetch<StationFoodItemOutputs>(hallId, 'GET');
            this.mapStationItems(hallId, data);
        }

        await Promise.allSettled([
            fetchData(DiningHallsEnum.Ohill),
            fetchData(DiningHallsEnum.Runk),
            fetchData(DiningHallsEnum.Newcomb),
        ]);
    }

    private getDiningHall(target: DiningHalls): Station {
        switch (target) {
            case DiningHallsEnum.Ohill:
                return this.diningHalls.ohill;
            case DiningHallsEnum.Newcomb:
                return this.diningHalls.newcomb;
            case DiningHallsEnum.Runk:
                return this.diningHalls.runk;
        }
    }

    private mapStationItems(target: DiningHalls, data: StationFoodItemOutputs | null): void {
        const diningHall = this.getDiningHall(target);
        const shopItems: ShopItems = new Map();
        const stationNames: StationNames = new Set();

        if (!data) {
            return;
        }

        data.forEach((foodItem) => {
            if (!shopItems.has(foodItem.stationName)) {
                shopItems.set(foodItem.stationName, []);
                stationNames.add(foodItem.stationName);
            }

            shopItems.get(foodItem.stationName)
                ?.push(foodItem.item);
        });

        shopItems.forEach((item) => {
            item.sort((a: FoodItemOutput, b: FoodItemOutput) => {
                /**
                 * Sorting order is determined by popularity (not implemented)
                 * and the length of all text inputs, as this usually references an entree, not an appetizer
                 */
                return (b.name.length + b.description.length)
                    - (a.name.length + a.description.length);
            })
        });

        diningHall.shopItems = shopItems;
        diningHall.isLoaded = true;
        diningHall.stationNames = stationNames;
        this.isDataSet.next({
            target: diningHall.diningHall,
            result: true,
        });
    }

    public getShopItems(target: DiningHalls): Readonly<ShopItems> {
        switch (target) {
            case DiningHallsEnum.Newcomb:
                return this.diningHalls.newcomb.shopItems;

            case DiningHallsEnum.Ohill:
                return this.diningHalls.ohill.shopItems;

            case DiningHallsEnum.Runk:
                return this.diningHalls.runk.shopItems;

            default:
                throw new Error('Unknown shop item identifier');
        }
    }

    public async sendReview(target: DiningHalls, content: FoodItemInput): Promise<void> {
        await this.fetch<FoodItemInput>(target, 'POST', content);
    }

    public isDataLoaded(target?: DiningHalls): boolean {
        if (target) {
            return this.getDiningHall(target).isLoaded;
        }
        
        return Object.values(this.diningHalls)
            .some((cur: Station) => cur.isLoaded);
    }

    get isDataLoaded$() {
        return this.isDataSet.asObservable();
    }
}
