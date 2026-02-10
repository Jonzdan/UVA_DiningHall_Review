import { HttpErrorResponse } from '@angular/common/http';
import { Component, type OnInit } from '@angular/core';
import { FoodService } from 'src/app/services';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    providers: [FoodService]
})
export class HomeComponent implements OnInit {
    constructor(
        private foodService: FoodService
    ) {}

    ngOnInit(): void {
        try {
            this.foodService.initialize();
        } catch (error) {
            if (!(error instanceof HttpErrorResponse)) {
                return;
            }
        }
        
    }
}
