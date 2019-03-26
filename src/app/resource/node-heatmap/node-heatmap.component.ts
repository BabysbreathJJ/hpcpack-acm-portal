import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Loop } from '../../services/api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'resource-node-heatmap',
  templateUrl: './node-heatmap.component.html',
  styleUrls: ['./node-heatmap.component.scss']
})
export class NodeHeatmapComponent implements OnInit, OnDestroy {
  public nodes = [];
  public categories = [];
  private interval: number;
  public selectedCategory: string;
  private heatmapLoop: Object;
  public activeMode;

  constructor(
    private api: ApiService
  ) {
    this.interval = 3000;
    this.activeMode = 'Node';
  }

  ngOnInit() {
    this.api.heatmap.getCategories().subscribe(categories => {
      this.categories = categories;
      this.selectedCategory = categories[0];
      this.heatmapLoop = this.getHeatmapInfo();
    })
  }


  categoryCtrl(): void {
    this.nodes = [];

    if (this.heatmapLoop) {
      Loop.stop(this.heatmapLoop);
    }
    this.heatmapLoop = this.getHeatmapInfo();
  }

  getHeatmapInfo(): any {
    return Loop.start(
      //observable
      //If you want to emulate the get operation, please call the in-memory web api function below.
      //this.api.heatmap.getMockData(this.selectedCategory),
      this.api.heatmap.get(this.selectedCategory),
      //observer
      {
        next: (result) => {
          this.nodes = result.results;
          return this.api.heatmap.get(this.selectedCategory);
        }
      },
      //interval in ms
      this.interval
    );
  }

  ngOnDestroy() {
    if (this.heatmapLoop) {
      Loop.stop(this.heatmapLoop);
    }
  }
}
