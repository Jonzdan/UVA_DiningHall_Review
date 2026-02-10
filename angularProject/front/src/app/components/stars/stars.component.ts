import { Component } from '@angular/core';

@Component({
    selector: 'app-stars',
    templateUrl: './stars.component.html',
    styleUrls: ['./stars.component.css'],
})
export class StarsComponent {
    public starsList: number[];
    private starRating: number;
    public hoveredStarCount: number;

    constructor() {
        this.starRating = this.hoveredStarCount = 0;
        this.starsList = [1, 2, 3, 4, 5];
    }

    updateActualStarCount(starCount: number) {
        if (starCount > this.starsList.length) {
            return;
        }
        this.starRating = starCount;
    }

    updateHoveredStarCount(starCount: number) {
        // Mouse leaves star review
        if (starCount === 0 && this.starRating !== starCount) {
            this.hoveredStarCount = this.starRating;
            return;
        }
        this.hoveredStarCount = starCount;
    }

    clearStarCount(): void {
        this.starRating = this.hoveredStarCount = 0;
    }

    getActualStarCount(): number {
        return this.starRating;
    }
}
