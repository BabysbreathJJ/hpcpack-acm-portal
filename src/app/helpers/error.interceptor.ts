import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // return next.handle(request).pipe(catchError(err => {
        //     if (err.status === 401) {
        //         if (this.router.url !== '/login' && this.router.url !== '/deployment') {
        //             // auto logout if 401 response returned from api
        //             this.authService.logout();
        //             location.reload(true);
        //         }
        //     }
        //     return throwError(err);
        // }))

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    event = event.clone({
                        headers: event.headers.set('WWW-Authenticate', '')
                    });
                }
                return event;
            })
        );
    }
}