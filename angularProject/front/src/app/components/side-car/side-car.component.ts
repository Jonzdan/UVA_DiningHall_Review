import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-side-car',
  templateUrl: './side-car.component.html',
})
export class SideCarComponent implements OnChanges {
    @Input() show = false;        // open/close state
    @Input() width = '250px';     // configurable width
    @Input() title = '';          // optional title
    @Input() icon?: any;

    @Output() close = new EventEmitter<void>();

    ngOnChanges(changes: SimpleChanges) {
    if (changes['show']) {
      console.log('Input changed:', changes['show'].currentValue);
    }
  }

    emitCloseEvent() {
        this.close.emit();
    }
}
