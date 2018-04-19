import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs/Subscription';
import { NewDiagnosticsComponent } from '../new-diagnostics/new-diagnostics.component';
import { NewCommandComponent } from '../new-command/new-command.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'resource-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.css']
})
export class NodeListComponent {
  private query = { filter: '' };

  private subcription: Subscription;

  private dataSource: MatTableDataSource<any> = new MatTableDataSource();

  private displayedColumns = ['select', 'name', 'health', 'state', 'runningJobCount', 'actions'];

  private selection = new SelectionModel(true, []);

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.api.node.getAll().subscribe(nodes => {
      this.dataSource.data = nodes;
    });
    this.subcription = this.route.queryParamMap.subscribe(params => {
      this.query.filter = params.get('filter');
      this.updateUI();
    });
  }

  updateUI() {
    let filter = this.query.filter;
    this.dataSource.filter = filter;
  }

  updateUrl() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: this.query });
  }

  get selectedData(): any[] {
    return this.selection.selected;
  }

  private isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  private masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  private select(node) {
    this.selection.clear();
    this.selection.toggle(node);
  }

  runDiagnostics() {
    let dialogRef = this.dialog.open(NewDiagnosticsComponent, {
      width: '98%',
      data: {}
    });

    //TODO: Run diagnostic tests on user selected nodes...
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let targetNodes = this.selection.selected.map(e => e.name);
        let diagnosticTest = result['selectedTests'].map(e => {
          // return { name: e.name, category: e.category, arguments: JSON.stringify(e.arguments).replace(/\"/g, '\\"') }
          return { name: e.name, category: e.category, arguments: JSON.stringify(e.arguments) }
        });
        let name = result['diagTestName'];
        if (diagnosticTest.length > 0) {
          diagnosticTest = diagnosticTest[0];
        }
        console.log(result);

        console.log(diagnosticTest);
        this.api.diag.create(name, targetNodes, diagnosticTest).subscribe(obj => {
          let returnData = obj.headers.get('location').split('/');
          let jobId = returnData[returnData.length - 1];
          this.router.navigate([`/diagnostics/results`]);
        });
      }
    });
  }

  runCommand() {
    let dialogRef = this.dialog.open(NewCommandComponent, {
      width: '98%',
      data: {}
    });

    dialogRef.afterClosed().subscribe(cmd => {
      if (cmd) {
        let names = this.selection.selected.map(e => e.name);
        this.api.command.create(cmd, names).subscribe(obj => {
          this.router.navigate([`/command/results/${obj.id}`]);
        });
      }
    });
  }

  hasNoSelection(): boolean {
    return this.selectedData.length == 0;
  }
}
