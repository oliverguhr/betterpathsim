import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Moveable } from './moveable';

describe('MoveableComponent', () => {
  let component: Moveable;
  let fixture: ComponentFixture<Moveable>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Moveable ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Moveable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
