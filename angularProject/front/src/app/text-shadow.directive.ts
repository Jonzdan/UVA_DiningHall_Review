import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTextShadow]'
})
export class TextShadowDirective {

  constructor(private elementRef: ElementRef) { 
    this.elementRef.nativeElement.style.textShadow = "1px 1px 2px #454545"
  }

}
