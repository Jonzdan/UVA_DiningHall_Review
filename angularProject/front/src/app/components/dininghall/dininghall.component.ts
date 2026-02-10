import {
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    type OnInit,
} from '@angular/core';
import { FoodService, SwitchDininghallService, type ShopItems } from '../../services';
import { type DiningHalls } from 'hoorank-shared';
import { filter, firstValueFrom, Subscription, takeUntil, timeout } from 'rxjs';

@Component({
    selector: 'app-dininghall',
    templateUrl: './dininghall.component.html',
    styleUrls: ['./dininghall.component.css']
})
export class DininghallComponent implements OnInit {
    @Input()
    public displayHallName!: string;
    @Input()
    public displayDiningHall!: DiningHalls;

    private _showTitleText: boolean;
    private _isLoading: boolean;
    private _shopItems: ShopItems;
    private _displayItems: boolean;
    private _subscription: Subscription;

    @HostListener('window:resize', [])
    clarifyTab() {
        this._showTitleText = window.innerWidth <= 418;
    }

    constructor(
        private foodService: FoodService,
        private hallSelector: SwitchDininghallService,
    ) {
        this._showTitleText = false;
        this._isLoading = true;
        this._shopItems = new Map();
        this._displayItems = true;
        this._subscription = new Subscription();
    }

    async ngOnInit(): Promise<void> {
        try {
            await firstValueFrom(this.foodService.isDataLoaded$
                .pipe(
                    filter(({ result, target }) => {
                        return result && target === this.displayDiningHall
                    }),
                    timeout(2000)
                )
            );
        } catch (error) {
            this._showTitleText = false;
            this._isLoading = false;
            this._displayItems = false;
        }

        this._shopItems = this.foodService.getShopItems(this.displayDiningHall);
        this.clarifyTab();

        this._subscription.add(
            this.hallSelector.currentDiningHall.subscribe((value) => {
                if (value !== this.displayDiningHall) {
                    this._isLoading = false;
                    this._displayItems = false;
                    return;
                }

                this._isLoading = !this.foodService.isDataLoaded(this.displayDiningHall);
                this._displayItems = !this._isLoading;
                this._showTitleText = true;
            })
        );
    }

    ngOnDestroy(): void {
        this.hallSelector.initialize();
        this._subscription.unsubscribe();
    }

    get displayItems(): boolean {
        return this._displayItems;
    }

    get displayLoading(): boolean {
        return this._isLoading;
    }

    get displayTitleText(): boolean {
        return this._showTitleText;
    }

    get displayShopItems(): Readonly<ShopItems> {
        return this._shopItems;
    }
}
