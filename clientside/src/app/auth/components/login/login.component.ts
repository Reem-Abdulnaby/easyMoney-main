import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ToastrService } from 'ngx-toastr';
// import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  @ViewChild('errorRecord') private errorRecord!: SwalComponent;
  showWaiting: boolean;
  constructor(
    private as: AuthService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.showWaiting = false;
  }

  ngOnInit(): void {}

  login(form: any) {
    this.showWaiting = true;
    console.log(form.value);
    this.as.userLogin(form.value).subscribe({
      next: (res: any) => {
        this.toast.success('تم تسجيل الدخول بنجاح', 'تسجيل الدخول');
        console.log(res?.body);

        this.as.user.next(res?.body);
        localStorage.setItem('userToken', res?.body?.tokens[0]);
        localStorage.setItem('userName', res?.body?.name);
        localStorage.setItem('userId', res?.body?._id);
        localStorage.setItem('userRole', res?.body?.role);
        this.showWaiting = false;
        this.router.navigate(['user/dashboard']);
      },
      error: (err: any) => {
        this.errorRecord.text = 'البريد الالكتروني او كلمة السر غير صحيحة!';
        this.errorRecord.fire();
        this.showWaiting = false;
      },
    });
  }
}
