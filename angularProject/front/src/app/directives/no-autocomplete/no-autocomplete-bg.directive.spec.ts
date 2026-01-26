import type { ElementRef } from '@angular/core';
import { NoAutocompleteBgDirective } from './no-autocomplete-bg.directive';

describe('NoAutocompleteBgDirective', () => {
    let directive: NoAutocompleteBgDirective;
    let mockElementRef: ElementRef;

    beforeEach(() => {
        mockElementRef = {
            nativeElement: {
                className: '',
            },
        } as ElementRef;

        directive = new NoAutocompleteBgDirective(mockElementRef);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should append autofill on init', () => {
        directive.ngOnInit();
        expect(mockElementRef.nativeElement.className).toContain('autofill:');
    });
});
