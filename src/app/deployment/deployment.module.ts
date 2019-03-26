import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeploymentComponent } from './deployment/deployment.component';
import { DeploymentRoutingModule } from './deployment-routing.module';
import { MaterialsModule } from '../materials.module';
import { MsAdalAngular6Module } from 'microsoft-adal-angular6';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';

@NgModule({
  imports: [
    CommonModule,
    DeploymentRoutingModule,
    MaterialsModule
  ],
  declarations: [
    DeploymentComponent,
  ]
})
export class DeploymentModule { }
