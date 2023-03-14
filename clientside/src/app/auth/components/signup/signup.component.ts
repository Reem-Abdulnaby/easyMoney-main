import { Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';

interface RegisterModel {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  address: string;
  status: string;
  photo: string;
  whatsapp_num: number;
  facebook: string;
  website: string;
  payment_method: string;
  payment_method_number: number;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  @ViewChild('errorRecord') private errorRecord!: SwalComponent;
  // @ViewChild('successRecord') private successRecord!: SwalComponent;

  showWaiting: boolean;
  passValid: boolean;
  hasUpper: any;
  hasLower: any;
  hasSymbol: any;
  hasNumber: any;

  @ViewChild('image') image!: ElementRef<any>;
  constructor(
    private as: AuthService,
    private router: Router,
    private toast: ToastrService
  ) {
    this.showWaiting = false;
    this.passValid = true;
  }

  ngOnInit() {}

  // checkPasswordValid(value: string) {
  //   console.log(value);

  //   let regularExpression =
  //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
  //     checkUpper = /^(?=.*[A-Z])/,
  //     checkLower = /^(?=.*[a-z])/,
  //     checkSymbol = /^(?=.*[@$!%*?&])/,
  //     checkNumber = /^(?=.*\d)/;

  //   if (checkUpper.test(value)) {
  //     this.hasUpper = true;
  //   } else {
  //     this.hasUpper = false;
  //   }

  //   if (checkLower.test(value)) {
  //     this.hasLower = true;
  //   } else {
  //     this.hasLower = false;
  //   }

  //   if (checkSymbol.test(value)) {
  //     this.hasSymbol = true;
  //   } else {
  //     this.hasSymbol = false;
  //   }

  //   if (checkNumber.test(value)) {
  //     this.hasNumber = true;
  //   } else {
  //     this.hasNumber = false;
  //   }

  //   if (!regularExpression.test(value)) {
  //     this.passValid = false;
  //     console.log(regularExpression.test(value));
  //   } else {
  //     this.passValid = true;
  //     console.log(regularExpression.test(value));
  //   }
  // }

  signup(form1: any, form2: any) {
    this.showWaiting = true;

    const userModel: RegisterModel = {
      name: form1.firstName + ' ' + form1.lastName,
      email: form1.email,
      phone: form1.phone,
      password: form1.password,
      role: form1.role,
      address: form2.address,
      status: 'active',
      photo: form2.image,
      whatsapp_num: form2.whatsNum,
      facebook: form2.faceLink,
      website: form2.webLink,
      payment_method: form2.paymentMethod,
      payment_method_number: form2.paymentNumber,
    };

    console.log(userModel);

    this.as.userRegister(userModel).subscribe({
      next: (res: any) => {
        // this.successRecord.fire();
        this.toast.success('تم انشاء الحساب بنجاح', 'انشاء حساب');
        this.as.user.next(res);
        localStorage.setItem('userToken', res?.tokens[0]);
        localStorage.setItem('userName', res?.name);
        localStorage.setItem('userId', res?._id);
        localStorage.setItem('userRole', res?.role);
        this.showWaiting = false;
        this.router.navigate(['user/dashboard']);
      },
      error: (err: any) => {
        if (err.error.includes('phone')) {
          this.errorRecord.text = 'هذا الرقم لدية حساب بالموقع بالفعل!';
          this.errorRecord.fire();
        }
        if (err.error.includes('email')) {
          this.errorRecord.text = 'هذا البريد الالكتروني لدية حساب بالفعل!';
          this.errorRecord.fire();
        }
        this.showWaiting = false;
      },
    });
  }
}
