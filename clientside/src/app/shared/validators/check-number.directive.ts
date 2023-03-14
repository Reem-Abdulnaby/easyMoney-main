import { Attribute, Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
  selector: '[appCheckNumber]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useClass: CheckNumberDirective,
      multi: true,
    },
  ],
})
export class CheckNumberDirective implements Validator {
  checkNumber = /^(?=.*\d)/;

  constructor(@Attribute('appCheckNumber') public PasswordControl: string) {}

  validate(c: FormControl): any {
    const Password = c.value;
    if (this.checkNumber.test(Password)) {
      return;
    } else {
      return { number: false };
    }
  }
}
