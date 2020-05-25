import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Map } from './map';

describe('MapComponent', () => {
  let component: Map;
  let fixture: ComponentFixture<Map>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Map ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Map);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
