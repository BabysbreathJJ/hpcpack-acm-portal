import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TableOptionComponent } from '../../widgets/table-option/table-option.component';
import { ApiService, Loop } from '../../services/api.service';
import { TableSettingsService } from '../../services/table-settings.service';
import { JobStateService } from '../../services/job-state/job-state.service';
import { TableDataService } from '../../services/table-data/table-data.service';
import { ClusrunJob } from '../../models/command/clusrun-job';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent implements OnInit {

  public dataSource = new MatTableDataSource();

  static customizableColumns = [
    { name: 'createdAt', displayName: 'Created', displayed: true },
    { name: 'command', displayName: 'Command', displayed: true },
    { name: 'state', displayName: 'State', displayed: true },
    { name: 'progress', displayName: 'Progress', displayed: true },
    { name: 'updatedAt', displayName: 'Last Changed', displayed: true },
  ];

  private availableColumns;

  public displayedColumns;

  private selection = new SelectionModel(true, []);

  private lastId = 0;
  private previousFirstItemId = -1;
  private previousResultSize = -1;
  private commandLoop: object;
  public maxPageSize = 1000;

  private reverse = true;
  public currentData = [];
  public scrolled = false;
  private interval = 5000;
  public loading = true;
  public jobs: Array<ClusrunJob>;
  public queryForm: FormGroup;

  constructor(
    private api: ApiService,
    private jobStateService: JobStateService,
    private tableDataService: TableDataService,
    private dialog: MatDialog,
    private settings: TableSettingsService,
  ) { }

  ngOnInit() {
    this.loadSettings();
    this.getDisplayedColumns();
    this.queryForm = new FormGroup({
      'querySize': new FormControl(this.maxPageSize, [
        Validators.min(1),
        Validators.max(1000)
      ]),
      'queryId': new FormControl(this.lastId, [
        Validators.min(0)
      ])
    });

    this.commandLoop = this.excuteLoop();
  }

  excuteLoop() {
    return Loop.start(
      this.getCommandRequest(),
      {
        next: (result) => {
          this.jobs = result;
          this.loading = false;
          return this.getCommandRequest();
        }
      },
      this.interval
    );
  }

  get querySize() {
    return this.queryForm.get('querySize');
  }

  get queryId() {
    return this.queryForm.get('queryId');
  }

  ngOnDestroy() {
    if (this.commandLoop) {
      Loop.stop(this.commandLoop);
    }
  }

  trackByFn(index, item) {
    return this.tableDataService.trackByFn(item, this.displayedColumns);
  }

  queryJobs() {
    if (this.querySize.invalid || this.queryId.invalid) {
      return;
    }
    if (this.queryId.value != this.lastId || this.querySize.value != this.maxPageSize) {
      this.lastId = this.queryId.value;
      this.maxPageSize = this.querySize.value;
      this.loading = true;
      Loop.stop(this.commandLoop);
      this.commandLoop = this.excuteLoop();
    }
  }

  getColumnOrder(col) {
    let index = this.displayedColumns.findIndex(item => {
      return item == col;
    });

    let order = index + 1;
    if (order) {
      return { 'order': index + 1 };
    }
    else {
      return { 'display': 'none' };
    }
  }

  private stateIcon(state) {
    return this.jobStateService.stateIcon(state);
  }

  private stateClass(state) {
    return this.jobStateService.stateClass(state);
  }

  private getCommandRequest() {
    return this.api.command.getJobsByPage({ lastId: this.lastId, count: this.maxPageSize, reverse: this.reverse });
  }

  getDisplayedColumns(): void {
    let columns = this.availableColumns.filter(e => e.displayed).map(e => e.name);
    // columns.push('actions');
    this.displayedColumns = ['id'].concat(columns);
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
    this.settings.save('CommandList', this.availableColumns);
  }

  loadSettings(): void {
    this.availableColumns = this.settings.load('CommandList', ResultListComponent.customizableColumns);
  }

  private scrollTimer = null;
  onScroll($event, delay: number = 100) {
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      let scrolledTopHeight = $event.srcElement.scrollTop;
      if (scrolledTopHeight > 0) {
        this.scrolled = true;
      }
      else if (scrolledTopHeight === 0) {
        this.scrolled = false;
      }
    });
  }

}