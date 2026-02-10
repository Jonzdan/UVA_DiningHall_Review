import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { DiningHallState } from './types';
import { DiningHallsEnum, type DiningHalls } from 'hoorank-shared';

@Injectable()
export class SwitchDininghallService {
    
    private diningHallStates: DiningHallState;
    private currentState: BehaviorSubject<DiningHalls>;
    public currentDiningHall: Observable<DiningHalls>;

    constructor() {
        this.diningHallStates = {
            Newcomb: false,
            Runk: false,
            Ohill: true,
        };

        this.currentState = new BehaviorSubject<DiningHalls>(DiningHallsEnum.Ohill);
        this.currentDiningHall = this.currentState.asObservable();
    }

    /**
     * Old: Called changeData
     */
    changeState(state: DiningHalls) {
        for (const hall in this.diningHallStates) {
            this.diningHallStates[hall as DiningHalls] = hall === state;
        }
        this.currentState.next(state);
    }

    /**
     * Called reinstantiate before
     */
    initialize(): void {
        this.currentState = new BehaviorSubject<DiningHalls>(DiningHallsEnum.Ohill);
    }

    getDiningHalls(): DiningHalls[] {
        return Object.keys(this.diningHallStates) as DiningHalls[];
    }
}
