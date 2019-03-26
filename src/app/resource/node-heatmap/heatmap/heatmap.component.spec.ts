import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatmapComponent } from './heatmap.component';
import { MaterialsModule } from '../../../materials.module';
import { FormsModule } from '@angular/forms';

describe('HeatmapComponent', () => {
  let component: HeatmapComponent;
  let fixture: ComponentFixture<HeatmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HeatmapComponent],
      imports: [MaterialsModule, FormsModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
