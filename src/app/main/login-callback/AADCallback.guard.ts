import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MsAdalAngular6Service } from 'microsoft-adal-angular6';


@Injectable()
export class AADCallbackHandler implements CanActivate {

    constructor(private router: Router, private adalService: MsAdalAngular6Service) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        this.adalService.handleCallback();

        if (this.adalService.userInfo) {
            this.router.navigate(['/deployment']);
        }
        else
            return false;
    }

} 