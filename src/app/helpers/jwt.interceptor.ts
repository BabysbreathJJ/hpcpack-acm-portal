import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MsAdalAngular6Service } from 'microsoft-adal-angular6';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private adalService: MsAdalAngular6Service, private api: ApiService, private authService: AuthService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with basic auth token if available
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${this.adalService.accessToken}`
            }
        });
        return next.handle(request);
    }
}