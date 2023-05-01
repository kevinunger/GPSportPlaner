import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/']);
      return false;
    }

    const jwtPayload = JSON.parse(atob(token.split('.')[1]));
    const userRole = jwtPayload.role;

    const expectedRole = route.data['expectedRole'];

    const roleHierarchy = ['user', 'admin', 'master'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const expectedRoleIndex = roleHierarchy.indexOf(expectedRole);

    if (userRoleIndex >= expectedRoleIndex) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
