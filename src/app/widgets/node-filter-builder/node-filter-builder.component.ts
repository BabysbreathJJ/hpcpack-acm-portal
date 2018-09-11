import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-node-filter-builder',
  templateUrl: './node-filter-builder.component.html',
  styleUrls: ['./node-filter-builder.component.css']
})
export class NodeFilterBuilderComponent implements OnInit {
  public states = ['online', 'offline'];

  public healths = ['ok', 'error'];

  public groups = ['HeadNode', 'WorkerNode'];

  private filter: string = '';
  public name: string;
  public state: string;
  public health: string;
  public group: string;

  constructor(
    public dialogRef: MatDialogRef<NodeFilterBuilderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filter = data.filter;
  }

  ngOnInit() {
  }

  build(): string {
    let result = this.name || '';
    if (this.state)
      result += ' state:' + this.state;
    if (this.health)
      result += ' health:' + this.health;
    if (this.group)
      result += ' group:' + this.group;
    return result.trim();
  }
}
