import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CdkOverlayOrigin, OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';

@Component({
  selector: 'app-dropdown',
  templateUrl: './drop-down.component.html',
  standalone: true,
  imports: [OverlayModule],
  styleUrls: ['./drop-down.component.css']
})
export class DropDownComponent {
    @Input() triggerIcon?: string;
    @Input() triggerText?: string;  
    @Input() align: 'left' | 'right' = 'right';
    @Input() open!: boolean;

    @Output() openChange = new EventEmitter<boolean>();

    constructor() {}

    @ViewChild(CdkOverlayOrigin) origin!: CdkOverlayOrigin;

    ngAfterViewInit() {
        console.log(this.origin);
    }

    overlayPositions: ConnectedPosition[] = [
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }
    ];

    toggle() {
        this.openChange.emit(!this.open);
    }

    close() {
        this.openChange.emit(false);
    }
}
