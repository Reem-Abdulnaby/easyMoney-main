import { Attribute, Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
  selector: '[appCheckSymbol]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useClass: CheckSymbolDirective,
      multi: true,
    },
  ],
})
export class CheckSymbolDirective implements Validator {
  checkSymbol = /^(?=.*[@$!%*?&])/;

  constructor(@Attribute('appCheckSymbol') public PasswordControl: string) {}

  validate(c: FormControl): any {
    const Password = c.value;
    if (this.checkSymbol.test(Password)) {
      return;
    } else {
      return { symbol: false };
    }
  }
}
