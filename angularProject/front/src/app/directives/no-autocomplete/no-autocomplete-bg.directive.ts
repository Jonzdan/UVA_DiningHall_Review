import { Directive, ElementRef } from '@angular/core';

const AUTOFILL_CLASSES = [
    'autofill:active:shadow-[0_0_0_30px_white_inset_!important]',
    'autofill:shadow-[0_0_0_30px_white_inset_!important]',
    'autofill:hover:shadow-[0_0_0_30px_white_inset_!important]',
    'autofill:focus:shadow-[0_0_0_30px_white_inset_!important]',
].join(' ');

@Directive({
    selector: '[appNoAutocompleteBg]',
})
export class NoAutocompleteBgDirective {
    constructor(private elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {
        this.elementRef.nativeElement.className += ' ' + AUTOFILL_CLASSES;
    }
}
