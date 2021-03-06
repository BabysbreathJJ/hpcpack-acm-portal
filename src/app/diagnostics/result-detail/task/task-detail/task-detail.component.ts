import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from '../../../../services/api.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  public message: any;
  public hasResult = true;
  public taskState = "";

  constructor(
    private api: ApiService,
    public dialogRef: MatDialogRef<TaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.taskState = this.data.taskState;
    if (this.data.taskState !== "Finished" && this.data.taskState !== "Failed" && this.data.taskState !== "Canceled") {
      this.hasResult = false;
    }
    else {
      this.api.diag.getDiagTaskResult(this.data.jobId, this.data.taskId).subscribe(result => {
        this.message = result.message;
      });
    }
  }

  public close() {
    this.dialogRef.close();
  }

}
