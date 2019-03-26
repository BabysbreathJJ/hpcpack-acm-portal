import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TableOptionComponent } from '../../widgets/table-option/table-option.component';
import { TableSettingsService } from '../../services/table-settings.service';
import { MsAdalAngular6Service } from 'microsoft-adal-angular6';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.component.html',
  styleUrls: ['./deployment.component.scss']
})
export class DeploymentComponent implements OnInit {

  public dataSource: MatTableDataSource<any> = new MatTableDataSource();

  static customizableColumns = [
    { name: 'kind', displayName: 'Kind', displayed: true, },
    { name: 'type', displayName: 'Type', displayed: true }
  ];

  private availableColumns;
  public displayedColumns;

  private selectuiion = new SelectionModel(true, []);
  private selectedNodes = [];


  constructor(
    private dialog: MatDialog,
    private settings: TableSettingsService,
    private adalSvc: MsAdalAngular6Service,
    private api: ApiService
  ) { }

  ngOnInit() {
    if (this.adalSvc.isAuthenticated) {
      this.api.deploy.getSubscriptions().subscribe(subs => {
        console.log(subs);
      });
    }
  }

  customizeTable(): void {
    let dialogRef = this.dialog.open(TableOptionComponent, {
      width: '98%',
      data: { columns: this.availableColumns }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.availableColumns = res.columns;
        this.getDisplayedColumns();
        this.saveSettings();
      }
    });
  }

  saveSettings(): void {
    this.settings.save('DeploymentComponent', this.availableColumns);
  }

  loadSettings(): void {
    this.availableColumns = this.settings.load('NodeListComponent', DeploymentComponent.customizableColumns);
  }

  getDisplayedColumns(): void {
    let columns = this.availableColumns.filter(e => e.displayed).map(e => e.name);
    this.displayedColumns = ['select', 'name'].concat(columns);
  }


  private isAllSelected() {
    const numSelected = this.selectedNodes.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  private masterToggle() {
    this.isAllSelected() ?
      this.selectedNodes = [] :
      this.dataSource.data.forEach(row => {
        let index = this.selectedNodes.findIndex(n => {
          return n.id == row.id;
        });
        if (index == -1) {
          this.selectedNodes.push(row);
        }
      });
  }

  public hasNoSelection(): boolean {
    return this.selectedNodes.length == 0;
  }

  private isSelected(node): boolean {
    let index = this.selectedNodes.findIndex(n => {
      return n.id == node.id;
    });
    return index == -1 ? false : true;
  }

  public enroll() {

  }

  public deploy() {

  }
}
