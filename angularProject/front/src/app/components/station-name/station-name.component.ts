import { Component, Input, type OnInit } from '@angular/core';
import { FoodService, type ShopItems } from '../../services';
import type { DiningHalls } from 'hoorank-shared';
import { ExpandSectionEnum, type ExpandSection } from './types';

@Component({
    selector: 'app-station-name',
    templateUrl: './station-name.component.html',
    styleUrls: ['./station-name.component.css'],
})
export class StationNameComponent implements OnInit {
    @Input() stationName!: string;
    @Input() diningHall!: DiningHalls;

    /**
     * Deep copy of service-level ShopItems
     */
    public shopItems: ShopItems;

    public isStationExpanded: boolean;
    public isItemsExpanded: boolean;
    public defaultItemLimit: number;

    constructor(private appService: FoodService) {
        this.shopItems = new Map();
        this.isItemsExpanded = false;
        this.isStationExpanded = true;
        this.defaultItemLimit = 3;
    }

    ngOnInit(): void {
        this.shopItems = this.appService.getShopItems(this.diningHall);
    }

    toggleStationDisplay(): void {
        this.isStationExpanded = !this.isStationExpanded;
    }

    toggleAdditionalItemsDisplay(): void {
        this.isItemsExpanded = !this.isItemsExpanded;
    }

    convertBooleanToSectionToken(bool: boolean): ExpandSection {
        return bool ? ExpandSectionEnum.ARROW_DOWN : ExpandSectionEnum.ARROW_UP;
    }
}
