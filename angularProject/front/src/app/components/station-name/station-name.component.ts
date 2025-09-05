import { Component, Input, type OnInit } from '@angular/core';
import { AppService } from '../../services';

@Component({
    selector: 'app-station-name',
    templateUrl: './station-name.component.html',
    styleUrls: ['./station-name.component.css'],
})
export class StationNameComponent implements OnInit {
    @Input() head!: string;
    @Input() short!: string;
    hideStation = false;
    shopToItems: any = {};
    flipArrow = false;
    showRestOfItems = false;

    constructor(private appService: AppService) {}

    ngOnInit(): void {
        this.shopToItems = this.appService.getShopToItem(this.short);
    }

    hideStationFunc(e: any) {
        this.hideStation = !this.hideStation;
    }

    ngAfterViewInit(): void {}

    revealItems(e: any) {
        this.showRestOfItems = !this.showRestOfItems;
        if (!this.showRestOfItems) e.target.textContent = '+';
        else e.target.textContent = '-';
    }
}
