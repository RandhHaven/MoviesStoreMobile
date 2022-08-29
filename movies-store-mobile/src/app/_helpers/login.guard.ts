import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../_services/account.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {

  constructor(
    private router: Router,
    private accountService: AccountService
  ) { }

  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve, reject) => {
      this.accountService.isAuthenticated().subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate(['home'], { replaceUrl: true });
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    // if (this.accountService.userValue) {
    //   this.router.navigate(['/home']);
    //   return false;
    // }
    // return true;
  }
}
