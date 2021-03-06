import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs/observable/of';
import { BreadcrumbComponent } from './breadcrumb.component';
import { ActivatedRoute, Router, NavigationEnd, Params } from '@angular/router';
import { Directive, Input } from '@angular/core';

const activatedRouteStub = {
  // params: of({ breadcrumb: 'Test' }),
  root: {
    children: [
      {
        children: [],
        snapshot: {
          children:[],
          data: {
            breadcrumb: 'Test'
          },
          url: [
            { path: 'Test' }
          ]
        }
      }
    ]
  }
}

const routerStub = {
  navigate: () => { },
  events: of(new NavigationEnd(0, '', ''))
}

@Directive({
  selector: '[routerLink]',
  host: { '(click)': 'onClick()' }
})
class RouterLinkDirectiveStub {
  @Input('routerLink') linkParams: any;
  navigatedTo: any = null;

  onClick() {
    this.navigatedTo = this.linkParams;
  }
}

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RouterLinkDirectiveStub,
        BreadcrumbComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});