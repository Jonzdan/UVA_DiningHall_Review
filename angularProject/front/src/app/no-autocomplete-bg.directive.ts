import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appNoAutocompleteBg]'
})
export class NoAutocompleteBgDirective {

  constructor(private elementRef: ElementRef) { }

  ngOnInit():void {
    this.elementRef.nativeElement.className += " autofill:active:shadow-[0_0_0_30px_white_inset_!important] autofill:shadow-[0_0_0_30px_white_inset_!important] autofill:hover:shadow-[0_0_0_30px_white_inset_!important] autofill:focus:shadow-[0_0_0_30px_white_inset_!important]"
  }

}
