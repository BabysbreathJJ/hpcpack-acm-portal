import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { NotificationComponent } from '../notification/notification.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { MaterialsModule } from '../materials.module';
import { WidgetsModule } from '../widgets/widgets.module';
import { MainComponent } from './main.component';
import { AuthenticationGuard, MsAdalAngular6Module } from 'microsoft-adal-angular6';
import { LoginCallbackComponent } from './login-callback/login-callback.component';
import { AADCallbackHandler } from './login-callback/AADCallback.guard';

@NgModule({
  declarations: [
    MainComponent,
    NotificationComponent,
    BreadcrumbComponent,
    LoginCallbackComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    MaterialsModule,
    WidgetsModule
  ],
  providers: [
    AuthenticationGuard,
    AADCallbackHandler,

  ]
})
export class MainModule { }
