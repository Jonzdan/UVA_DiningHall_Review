import { Component, Input, isDevMode, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'app-toggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.component.css'],
})
export class ToggleComponent {
    @Input() isToggled?: boolean;
    @Input() name?: string;
    @Input() subtext?: string;

    @Output() isToggledChange = new EventEmitter<boolean>();

    updateToggle(): void {
        if (this.isToggled === undefined) {
            if (isDevMode()) {
                console.error(`Toggle ${this.name} has no initial value`);
            }
            return;
        }
        this.isToggledChange.emit(!this.isToggled);
    }
}
