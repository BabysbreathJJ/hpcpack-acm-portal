import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { MainComponent } from './main.component';
import { AuthenticationGuard } from 'microsoft-adal-angular6';
import { LoginCallbackComponent } from './login-callback/login-callback.component';
import { AADCallbackHandler } from './login-callback/AADCallback.guard';

const routes: Routes = [{
    path: '',
    component: MainComponent,
    children: [
        {
            path: 'dashboard',
            loadChildren: 'app/dashboard/dashboard.module#DashboardModule',
            data: { breadcrumb: "Dashboard" },
            canActivate: [AuthGuardService]
        },
        {
            path: 'resource',
            loadChildren: 'app/resource/resource.module#ResourceModule',
            data: { breadcrumb: "Resource" },
            canActivate: [AuthGuardService]
        },
        {
            path: 'diagnostics',
            loadChildren: 'app/diagnostics/diagnostics.module#DiagnosticsModule',
            data: { breadcrumb: "Diagnostics" },
            canActivate: [AuthGuardService]
        },
        {
            path: 'command',
            loadChildren: 'app/command/command.module#CommandModule',
            data: { breadcrumb: "Cluster Run" },
            canActivate: [AuthGuardService]
        },
        {
            path: 'deployment',
            loadChildren: 'app/deployment/deployment.module#DeploymentModule',
            data: { breadcrumb: "Deployment" },
            canActivate: [AuthenticationGuard]
        },
        {
            path: 'id_token',
            component: LoginCallbackComponent,
            canActivate: [AADCallbackHandler]
        },
        {
            path: 'access_token',
            component: LoginCallbackComponent,
            canActivate: [AADCallbackHandler]
        },
        {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
        },
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MainRoutingModule { }
