import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SwitchDininghallService {
    _name1 = 'Observatory Hill Dining Hall';
    _name1Boolean = true;
    _name2 = 'Newcomb Dining Hall';
    _name2Boolean = false;
    _name3 = 'Runk Dining Hall';
    _name3Boolean = false;
    private _boolean = new BehaviorSubject<string>('ohill');

    constructor() {}

    changeData(s: string) {
        const name = s;
        switch (name) {
            case this._name1: {
                this._name1Boolean = true;
                this._name2Boolean = false;
                this._name3Boolean = false;
                this._boolean.next('ohill');
                break;
            }
            case this._name2: {
                this._name2Boolean = true;
                this._name1Boolean = false;
                this._name3Boolean = false;
                this._boolean.next('newcomb');
                break;
            }
            case this._name3: {
                this._name3Boolean = true;
                this._name1Boolean = false;
                this._name2Boolean = false;
                this._boolean.next('runk');
                break;
            }
        }
    }

    reinstantiate() {
        this._boolean = new BehaviorSubject('ohill');
    }

    get observable() {
        return this._boolean;
    }
    get name1() {
        return this._name1;
    }
    get name2() {
        return this._name2;
    }
    get name3() {
        return this._name3;
    }
    get name1Boolean() {
        return this._name1Boolean;
    }
    get name2Boolean() {
        return this._name2Boolean;
    }
    get name3Boolean() {
        return this._name3Boolean;
    }
}
