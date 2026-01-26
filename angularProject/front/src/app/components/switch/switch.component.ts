import { Component, type OnDestroy, type OnInit } from '@angular/core';
import { SwitchDininghallService } from '../../services';
import { DiningHallsEnum, type DiningHalls } from 'hoorank-shared';
import type { Subscription } from 'rxjs';

@Component({
    selector: 'app-switch',
    templateUrl: './switch.component.html',
    styleUrls: ['./switch.component.css'],
    providers: [SwitchDininghallService]
})
export class SwitchComponent implements OnInit, OnDestroy {
    private bgColor = 'bg-[#EB5F0C]';
    private currentDiningHall: DiningHalls;
    private diningHallSubscription?: Subscription;

    constructor(
        private selectorService: SwitchDininghallService,
    ) {
        this.currentDiningHall = DiningHallsEnum.Ohill;
    }

    ngOnInit(): void {
        this.diningHallSubscription = this.selectorService.currentDiningHall.subscribe((value) => {
            this.currentDiningHall = value;
        })
    }

    ngOnDestroy(): void {
        if (this.diningHallSubscription) {
            this.diningHallSubscription.unsubscribe();
        }
    }

    changeData(value: DiningHalls): void {
        this.selectorService.changeState(value);
    }

    getButtonName(value: DiningHalls): string {
        return `${DiningHallsEnum[value]} Dining Hall`;
    }

    get diningHalls(): DiningHalls[] {
        return this.selectorService.getDiningHalls();
    }

    get activeDiningHall(): DiningHalls {
        return this.currentDiningHall;
    }
}
