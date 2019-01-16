import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Cell } from './cell';

describe('CellComponent', () => {
  let component: Cell;
  let fixture: ComponentFixture<Cell>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Cell ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Cell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
