import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-side-car',
  templateUrl: './side-car.component.html',
})
export class SideCarComponent {
    @Input() show = false;        // open/close state
    @Input() width = '250px';     // configurable width
    @Input() title = '';          // optional title
    @Input() icon?: any;

    @Output() close = new EventEmitter<void>();

    emitCloseEvent() {
        this.close.emit();
    }
}
