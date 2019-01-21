import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Assembler } from './assembler';

describe('AssemblerComponent', () => {
  let component: Assembler;
  let fixture: ComponentFixture<Assembler>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Assembler ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Assembler);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
