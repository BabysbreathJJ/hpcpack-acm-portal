import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { CommandResult } from '../../models/command-result';
import { ApiService, Loop } from '../../services/api.service';

@Component({
  selector: 'app-result-detail',
  templateUrl: './result-detail.component.html',
  styleUrls: ['./result-detail.component.scss']
})
export class ResultDetailComponent implements OnInit {
  @ViewChild('output')
  private output: ElementRef;

  private id: string;

  private states = ['all', 'queued', 'running', 'finished', 'failed', 'canceled'];

  private state = 'all';

  private name = '';

  private dataSource = new MatTableDataSource();

  private displayedColumns = ['name', 'state'];

  private selectedNode: any;

  private result: CommandResult;

  private subcription: Subscription;

  private mainLoop: object;

  private nodeLoop: object;

  private errorMsg: string;

  private nodeOutputs = {};

  private autoload = true;

  private loadingPrev = false;

  private loadingNext = false;

  private outputInitOffset = -4096;

  private outputPageSize = 4096;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.subcription = this.route.paramMap.subscribe(map => {
      this.nodeOutputs = {};
      this.id = map.get('id');
      this.updateResult(this.id);
    });
  }

  isLoaded(): boolean {
    return this.result && this.result.nodes.length > 0;
  }

  updateResult(id) {
    this.mainLoop = Loop.start(
      //observable:
      this.api.command.get(id),
      //observer:
      {
        next: (result) => {
          if (id != this.id) {
            return; //A false value indicates the end of the loop
          }
          //NOTE: this.result is replaced by a new object on each new GET so that
          //the node info saved on this.result.nodes doesn't persist between GETs!
          this.result = result;
          if (result.nodes.length == 0) {
            return true;
          }
          //filter depends on this.result.state, which is set by setResultState.
          this.setResultState();
          this.filter();
          return !this.isOver;
        },
        error: (err) => {
          this.errorMsg = err;
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.subcription) {
      this.subcription.unsubscribe();
    }
    if (this.mainLoop) {
      Loop.stop(this.mainLoop);
    }
    if (this.nodeLoop) {
      Loop.stop(this.nodeLoop);
    }
  }

  filter() {
    let res = this.result.nodes.filter(e => {
      if (this.state != 'all' && e.state != this.state)
        return false;
      if (e.name.toLowerCase().indexOf(this.name.toLowerCase()) < 0)
        return false;
      return true;
    });
    this.dataSource.data = res;
    if (!this.selectedNode || res.findIndex((e) => e.name == this.selectedNode.name) < 0)
      this.selectNode(res[0]);
  }

  selectNode(node) {
    if (!node) {
      this.selectedNode = node;
      return;
    }
    if (this.selectedNode && node.name == this.selectedNode.name) {
      return;
    }
    this.selectedNode = node;
    this.updateNodeResult(this.id, node);
  }

  getNodeOutput(node): any {
    let output = this.nodeOutputs[node.name];
    if (!output) {
      output = this.nodeOutputs[node.name] = { content: '', next: this.outputInitOffset, start: undefined, end: undefined };
    }
    return output;
  }

  updateNodeOutput(output, result): boolean {
    //NOTE: There may be two inflight updates for the same piece of output, one
    //by autoload and the other one by manual trigger. Drop the one arrives later.
    if (output.next > result.offset) {
      return false;
    }
    //Update start field when and only when it's not updated yet.
    if (typeof(output.start) === 'undefined') {
      output.start = result.offset;
    }
    //NOTE: result.end depends on passing an opt.over parameter to API getOutput.
    output.end = result.end;
    if (result.content) {
      output.content += result.content;
    }
    output.next = result.offset + result.size;
    return result.content ? true : false;
  }

  updateNodeOutputBackward(output, result): boolean {
    //Update next field when and only when it's not updated yet.
    if (output.next === this.outputInitOffset) {
      output.next = result.offset + result.size;
    }
    if (result.content) {
      output.content = result.content + output.content;
    }
    output.start = result.offset;
    return result.content ? true : false;
  }

  updateNodeResult(id, node) {
    //Cancel previous loop if any
    if (this.nodeLoop) {
      Loop.stop(this.nodeLoop);
    }
    let output = this.getNodeOutput(node)
    if (output.end) {
      return;
    }
    if (!this.autoload && output.content) {
      return;
    }
    let opt = { over: () => this.isOutputOver(node) };
    this.nodeLoop = Loop.start(
      //observable:
      this.api.command.getOutput(id, node.key, output.next, this.outputPageSize, opt as any),
      //observer:
      {
        next: (result) => {
          //id and/or node may change when result arrives in some time later.
          if (this.id != id || this.selectedNode.name != node.name) {
            //End the loop by returning a false value.
            return;
          }
          if (this.updateNodeOutput(output, result)) {
            setTimeout(() => this.scrollOutputToBottom(), 0);
          }
          let over = output.end || !this.autoload;
          return over ? false : this.api.command.getOutput(id, node.key, output.next, this.outputPageSize, opt as any);
        }
      },
      //interval(in ms):
      200
    );
  }

  get currentOutput(): object {
    if (!this.selectedNode)
      return;
    return this.nodeOutputs[this.selectedNode.name];
  }

  get currentOutputUrl(): string {
    return this.selectedNode ? this.api.command.getDownloadUrl(this.id, this.selectedNode.key) : '';
  }

  scrollOutputToBottom(): void {
    let elem = this.output.nativeElement;
    elem.scrollTop = elem.scrollHeight;
  }

  scrollOutputToTop(): void {
    let elem = this.output.nativeElement;
    elem.scrollTop = 0;
  }

  setResultState() {
    let stats = { running: 0, finished: 0, failed: 0 };
    this.result.nodes.forEach(e => {
      stats[e.state]++;
    });
    let state;
    if (stats.running > 0)
      state = 'running';
    else if (stats.failed > 0)
      state = 'failed';
    else
      state = 'finished';
    this.result.state = state;
    return state;
  }

  get isOver(): boolean {
    let state = this.result.state;
    return state == 'finished' || state == 'failed';
  }

  isNodeOver(node): boolean {
    let state = node.state;
    return state == 'finished' || state == 'failed';
  }

  isOutputOver(node): boolean {
    //NOTE: this.isNodeOver depends on the node info, which may be outdated because
    //the node parameter may be a captured value in a closure, which captured an "old"
    //value. So this.isOver is required and this.isNodeOver is just an optimization.
    return this.isNodeOver(this.selectedNode) || this.isOver;
  }

  toggleAutoload(enabled) {
    this.autoload = enabled;
    if (enabled) {
      this.updateNodeResult(this.id, this.selectedNode);
    }
  }

  get isManualLoadEnabled(): boolean {
    return !this.autoload && this.selectedNode;
  }

  loadPrev() {
    let output = this.getNodeOutput(this.selectedNode)
    if (output.start === 0) {
      return;
    }
    let prev;
    let pageSize = this.outputPageSize;
    if (output.start) {
      prev = output.start - this.outputPageSize;
      if (prev < 0) {
        prev = 0;
        pageSize = output.start;
      }
    }
    else {
      prev = this.outputInitOffset;
    }
    this.loadingPrev = true;
    let opt = { fulfill: true, over: () => this.isOutputOver(this.selectedNode) };
    this.api.command.getOutput(this.id, this.selectedNode.key, prev, pageSize, opt)
      .subscribe(result => {
        this.loadingPrev = false;
        if (this.updateNodeOutputBackward(output, result)) {
          setTimeout(() => this.scrollOutputToTop(), 0);
        }
      });
  }

  loadNext() {
    let output = this.getNodeOutput(this.selectedNode)
    if (output.end) {
      return;
    }
    this.loadingNext = true;
    let opt = { fulfill: true, over: () => this.isOutputOver(this.selectedNode) };
    this.api.command.getOutput(this.id, this.selectedNode.key, output.next, this.outputPageSize, opt)
      .subscribe(result => {
        this.loadingNext = false;
        if (this.updateNodeOutput(output, result)) {
          setTimeout(() => this.scrollOutputToBottom(), 0);
        }
      });
  }
}
