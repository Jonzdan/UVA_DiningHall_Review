import {
    Component,
    Input,
    isDevMode,
    type OnInit,
    ViewChild,
} from '@angular/core';
import { StarsComponent } from '../stars';
import { AccountService, FoodService } from '../../services';
import type { DiningHalls, FoodItemOutput } from 'hoorank-shared';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.css'],
})
export class ItemComponent implements OnInit {
    @Input() diningHall!: DiningHalls;
    @Input() stationName!: string;
    @Input() indicator!: number;

    // TODO: Look into later
    @ViewChild(StarsComponent) child!: StarsComponent;
    @ViewChild('front') mainCard!: any;

    private reviewContent: string;
    private _numStarsSelected: number;
    public isDisplayingReviewLayout: boolean;
    public avgStarRating: number;
    public item!: FoodItemOutput;
    public MAX_STAR_COUNT = 5;

    constructor(
        private foodService: FoodService,
        private accountService: AccountService,
    ) {
        this.isDisplayingReviewLayout = false;
        this._numStarsSelected = 0;
        this.avgStarRating = 0;
        this.reviewContent = '';
    }

    ngOnInit(): void {
        this.item = this.foodService.getShopItems(this.diningHall)
            .get(this.stationName)
            ?.at(
                this.indicator
            )!;

        this.avgStarRating = this.item.reviewOptions?.starRating ?? 0;
    }

    openReviewBox(): void {
        this.isDisplayingReviewLayout = !this.isDisplayingReviewLayout;
    }

    /**
     * Navigate to Reviews Tab
     * @param event
     */
    showReviews(event: Event): void {
        event.preventDefault();
    }

    updateStars(event: Event): void {
        const target = event.target as HTMLElement;
        if (typeof target.id !== 'number' || target.id <= 0 || target.id > 5) {
            return;
        };

        this._numStarsSelected = target.id;
    }

    setReviewContent(event: Event): void {
        this.reviewContent = (event.target as HTMLTextAreaElement).value;
    }

    isNaN(value: number) {
        return isNaN(value);
    }

    // TODO: Add error display (top-level most likely)
    async submitReview(): Promise<boolean> {
        if (!this.accountService.accountDetails.isSignedIn) {
            if (isDevMode()) {
                alert('Must be signed in to leave a review!');
            }
            return false;
        }

        if (this.reviewContent.length < 50 || this.reviewContent.length > 500) {
            return false;
        }

        try {
            await this.foodService.sendReview(this.diningHall, {
                name: this.item.name,
                reviewOptions: {
                    stars: this._numStarsSelected,
                    review: this.reviewContent
                }
            });
        } catch (error) {
            if (isDevMode()) {
                console.error(error);
            }

            return false;
        }
        return true;
    }

    get numStarsSelected() {
        return this._numStarsSelected;
    }
}
