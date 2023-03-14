import { environment as env } from 'src/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  // User Login
  userLogin(data: any): Observable<any> {
    return this.http.post(`${env.apiRoot}/users/login`, data);
  }

  // User Register
  userRegister(data: any): Observable<any> {
    return this.http.post(`${env.apiRoot}/users/signup`, data);
  }

  // Forget Password
  forgetPassword(email: any) {
    return this.http.get(`${env.apiRoot}/User/ForgetPassword/${email}`);
  }

  // reset password
  resetPassword(data: any, token: any) {
    return this.http.post(
      `${env.apiRoot}/User/UpdatePassword?token=${token}&new_password=${data?.new_password}&confirm_password=${data?.confirm_password}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
  }

  // logOut
  logOut(token: any) {
    return this.http.delete(`${env.apiRoot}/users/logout`, {
      headers: {
        Authorization: `barrier ${token}`,
      },
    });
  }

  // Logout From All Devices
  logOutFromAllDevices(token: any) {
    return this.http.delete(`${env.apiRoot}/users/logout-all-devices`, {
      headers: {
        Authorization: `barrier ${token}`,
      },
    });
  }
}
