import { NavigationStart, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  userName: any;
  userId: any;
  user: any;
  constructor(
    private as: AuthService,
    private toast: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.userId = localStorage.getItem('userId');
        this.userName = localStorage.getItem('userName');
      }
    });

    this.as.user.subscribe((res) => {
      console.log(res);
      this.user = res;
    });
    this.userName = localStorage.getItem('userName');
    this.userId = localStorage.getItem('userId');
  }

  logOut() {
    this.toast.success('تم تسجيل الخروج بنجاح', 'تسجيل الخروج');
    this.as.user.next(null);
    localStorage.clear();
    this.router.navigate(['auth/login']);
  }
  logOutFromAll() {
    this.toast.success('تم تسجيل الخروج بنجاح', 'تسجيل الخروج');
    this.as.user.next(null);
    localStorage.clear();
    this.router.navigate(['auth/login']);
  }
}
