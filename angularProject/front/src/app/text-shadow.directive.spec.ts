import { TextShadowDirective } from './text-shadow.directive';
import { ElementRef } from '@angular/core'

describe('TextShadowDirective', () => {
  it('should create an instance', () => {
    const e:ElementRef = new ElementRef(this)
    const directive = new TextShadowDirective(e);
    expect(directive).toBeTruthy();
  });
});
