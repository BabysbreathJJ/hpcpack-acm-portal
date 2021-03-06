import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableOptionComponent } from './table-option.component';
import { MaterialsModule } from '../../materials.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DragulaModule } from 'ng2-dragula';

class MatDialogModuleMock {
  close() { }
}

let customizableColumns = [
  { name: 'health', displayName: 'Health', displayed: true, },
  { name: 'state', displayName: 'State', displayed: true, },
  { name: 'os', displayName: 'OS', displayed: true },
  { name: 'runningJobCount', displayName: 'Jobs', displayed: true },
  { name: 'eventCount', displayName: 'Events', displayed: true },
  { name: 'memory', displayName: 'Memory', displayed: false },
];

describe('TableOptionComponent', () => {
  let component: TableOptionComponent;
  let fixture: ComponentFixture<TableOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableOptionComponent],
      imports: [MaterialsModule, DragulaModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogModuleMock },
        { provide: MAT_DIALOG_DATA, useValue: { columns: customizableColumns } }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
