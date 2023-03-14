import { Attribute, Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
  selector: '[appCheckUpper]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useClass: CheckUpperDirective,
      multi: true,
    },
  ],
})
export class CheckUpperDirective {
  checkUpper = /^(?=.*[A-Z])/;

  constructor(@Attribute('appCheckUpper') public PasswordControl: string) {}

  validate(c: FormControl): any {
    const Password = c.value;
    if (this.checkUpper.test(Password)) {
      return;
    } else {
      return { upperCase: false };
    }
  }
}
