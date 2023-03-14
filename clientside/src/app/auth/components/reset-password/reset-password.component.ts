// import { ToastrService } from 'ngx-toastr';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  userToken: any;
  showWaiting: boolean;
  constructor(
    private as: AuthService,
    // private toast: ToastrService,
    private router: Router,
    private ar: ActivatedRoute
  ) {
    this.userToken = this.ar.snapshot.params['token'];
    console.log(this.userToken);

    this.showWaiting = false;
  }

  ngOnInit(): void {}

  resetPassword(data: any) {
    this.showWaiting = true;
    let dataModel = {
      new_password: data?.password,
      confirm_password: data?.confpassword,
    };
    // this.as.resetPassword(dataModel, this.userToken).subscribe((res: any) => {
    //   this.showWaiting = false;
    //   // this.toast.success(
    //   //   'تم تغيير كلمة المرور بنجاح',
    //   //   'اعادة تعيين كلمة المرور'
    //   // );
    //   this.router.navigate(['']);
    // });
  }
}
