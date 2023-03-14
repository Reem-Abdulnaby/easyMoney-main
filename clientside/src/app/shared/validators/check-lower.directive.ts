import { Attribute, Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';

@Directive({
  selector: '[appCheckLower]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useClass: CheckLowerDirective,
      multi: true,
    },
  ],
})
export class CheckLowerDirective implements Validator {
  checkLower = /^(?=.*[a-z])/;

  constructor(@Attribute('appCheckLower') public PasswordControl: string) {}

  validate(c: FormControl): any {
    const Password = c.value;

    if (this.checkLower.test(Password)) {
      return;
    } else {
      return { lowerCase: false };
    }
  }
}
