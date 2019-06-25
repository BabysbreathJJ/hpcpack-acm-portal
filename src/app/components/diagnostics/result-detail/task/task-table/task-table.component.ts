import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges, OnDestroy } from '@angular/core';
import { TableOptionComponent } from 'app/widgets';
import { MatDialog } from '@angular/material';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { JobStateService } from 'app/services';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { TableService } from 'app/services';
import { VirtualScrollService } from 'app/services';

@Component({
  selector: 'diag-task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.scss']
})
export class TaskTableComponent implements OnInit, OnDestroy {
  @ViewChild('content') cdkVirtualScrollViewport: CdkVirtualScrollViewport;

  @Input()
  public empty: boolean;

  @Input()
  tableName: string;

  @Input()
  customizableColumns: any;

  public displayedColumns = [];

  @Input()
  dataSource: Array<any>;

  @Input()
  loadFinished: boolean;

  @Input()
  maxPageSize: number;

  @Output()
  updateLastIdEvent = new EventEmitter();

  public scrolled = false;

  private availableColumns;

  tasks = [];

  private lastId = 0;
  private reverse = true;

  pivot: number;

  startIndex = 0;
  lastScrolled = 0;

  public loading = false;

  private endId = -1;

  //Accessibility support
  public focusRowId;
  public tableRenderedRangeSub;


  constructor(
    private dialog: MatDialog,
    private jobStateService: JobStateService,
    private tableService: TableService,
    private virtualScrollService: VirtualScrollService
  ) { }

  ngOnInit() {
    this.loadSettings();
    this.getDisplayedColumns();
    this.pivot = Math.round(this.maxPageSize / 2) - 1;
    this.tableRenderedRangeSub = this.cdkVirtualScrollViewport.renderedRangeStream.subscribe(listrange => {
      setTimeout(() => {
        let row = document.getElementById(`${this.focusRowId}`);
        if (row) {
          row.setAttribute('tabindex', '0');
          row.setAttribute('aira-selected', 'true');
          row.focus();
        }
      }, 0);
    })
  }

  ngOnDestroy() {
    this.tableRenderedRangeSub.unsubscribe();
  }

  private setIcon(state) {
    return this.jobStateService.stateIcon(state);
  }

  private stateClass(state) {
    return this.jobStateService.stateClass(state);
  }

  private showDetail(jobId, taskId, taskState) {
    let dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '70%',
      data: { jobId: jobId, taskId: taskId, taskState: taskState }
    });
  }

  getDisplayedColumns(): void {
    let columns = this.availableColumns.filter(e => e.displayed).map(e => e.name);
    columns.push('state');
    columns.push('detail');
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
    this.tableService.saveSetting(this.tableName, this.availableColumns);
  }

  loadSettings(): void {
    this.availableColumns = this.tableService.loadSetting(this.tableName, this.customizableColumns);
  }


  trackByFn(index, item) {
    return this.tableService.trackByFn(item, this.displayedColumns);
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

  indexChanged($event) {
    let result = this.virtualScrollService.indexChangedCalc(this.maxPageSize, this.pivot, this.cdkVirtualScrollViewport, this.dataSource, this.lastScrolled, this.startIndex);
    this.pivot = result.pivot;
    this.lastScrolled = result.lastScrolled;
    this.lastId = result.lastId == undefined ? this.lastId : result.lastId;
    this.endId = result.endId == undefined ? this.endId : result.endId;
    this.loading = result.loading;
    this.startIndex = result.startIndex;
    this.scrolled = result.scrolled;
    this.updateLastIdEvent.emit({ lastId: this.lastId, endId: this.endId });
  }

  getFocusRowId($event) {
    this.focusRowId = $event;
  }

  get showScrollBar() {
    return this.tableService.isContentScrolled(this.cdkVirtualScrollViewport.elementRef.nativeElement);
  }
}