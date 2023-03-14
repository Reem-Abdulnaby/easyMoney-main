import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css'],
})
export class ForgetPasswordComponent implements OnInit {
  token: any;
  showWaiting: boolean;
  constructor(
    private as: AuthService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.showWaiting = false;
  }

  ngOnInit(): void {
    this.token = localStorage.getItem('userToken');
  }

  sendMail(data: any) {
    this.showWaiting = true;
  }
}
