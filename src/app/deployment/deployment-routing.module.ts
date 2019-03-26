import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { DeploymentComponent } from './deployment/deployment.component';
import { AuthenticationGuard } from 'microsoft-adal-angular6';

const routes: Routes = [{
    path: '',
    component: DeploymentComponent,
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DeploymentRoutingModule { }