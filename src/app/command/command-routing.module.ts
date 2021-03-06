import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommandComponent } from './command.component';
import { ResultListComponent } from './result-list/result-list.component';
import { ResultDetailComponent } from './result-detail/result-detail.component';
import { MultiCmdsComponent } from './multi-cmds/multi-cmds.component';

const routes: Routes = [{
  path: '',
  component: CommandComponent,
  children: [
    { path: 'results', component: ResultListComponent, data: { breadcrumb: "Results" } },
    { path: 'results/:id', component: ResultDetailComponent, data: { breadcrumb: "Result" } },
    { path: 'multi-cmds', component: MultiCmdsComponent, data: { breadcrumb: 'Multi-cmds' } },
    { path: '', redirectTo: 'results', pathMatch: 'full' },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommandRoutingModule { }
