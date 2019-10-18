import { Component, Sanitizer } from '@angular/core';
import { CellType } from '../cell-type/cell-type';
import { Position } from '../position/position';
import { DomSanitizer } from '@angular/platform-browser';
import {CellDisplayType} from '../cell-display-type/cell-display-type';
import { Content } from '@angular/compiler/src/render3/r3_ast';
//import { CellPriorityQueue } from 'src/app/tools';

@Component({
  selector: 'app-cell'
})
export class Cell {

  public position: Position;
  public cellType: CellType;

  public rhs: number;
  public distance: number;
  public estimatedDistance: number;
  public heuristicDistance: number;

  public color: any;
  public previous: Cell;
  public isOpen: boolean;
  private content: CellDisplayType[] = [];
  //private content: CellPriorityQueue<CellDisplayType>;

  constructor(row: number, col: number, cellType = CellType.Free) {
    this.position = new Position(col, row);
    this.cellType = cellType;
    
    //this.content = new CellPriorityQueue((a, b) => a - b)

    this.addDisplayType(CellDisplayType.Free)
  }

  public addDisplayType(type: CellDisplayType){    
    this.content.push(type)
    //this.content = this.content.sort(x => x.index).reverse()

    this.content = this.content.sort((a,b) => a.index < b.index ? -1 : a.index > b.index ? 1 : 0).reverse()

    this.color = this.getCurrentDisplayType().color
  }

  public removeCurrentDisplayType(){
    this.content.shift()
    this.color = this.getCurrentDisplayType().color
  }

  public removeDisplayType(type: CellDisplayType){
    this.content = this.content.filter(x => type != x)
    this.color = this.getCurrentDisplayType().color
  }


  public removeDisplayTypeByIndex(index:number){
    this.content = this.content.filter(x => x.index !== index)
    this.color = this.getCurrentDisplayType().color
  }

  public getCurrentDisplayType(){    
    return this.content[0]
  }

  /*################################################
            Getter / Setter - CellTyp
  #################################################*/
  set type(cellType) {
    this.cellType = cellType;
  }
  get type() {
    return this.cellType;
  }

  get currentContent() {
      return this.content;
  }

  /*################################################
        Abgleichsfunktionen für CellStatus(Typ)
  #################################################*/

  get isFree() {
    return this.cellType === CellType.Free;
  }
  get isBlocked() {
    return this.cellType === CellType.Blocked;
  }
  get isVisited() {
    return this.cellType === CellType.Visited;
  }
  get isCurrent() {
    return this.cellType === CellType.Current;
  }
  get isStart() {
    return this.cellType === CellType.Start;
  }
  get isGoal() {
    return this.cellType === CellType.Goal;
  }
  get isBlockable() {
    return this.isFree || this.isCurrent ||this.isVisited;
  }
  get getPosition() {
      return this.position;
  }

  /*################################################
             Positionsausgabe der Zelle
  #################################################*/

  public toString() {
    let result = `[${this.position.x},${this.position.y}]`;
  
    if (this.rhs !== undefined) {
      result += " | rhs = " + this.rhs;
    }
    if(this.distance !== undefined) {
      result += " | distance = " + this.distance;
    }
  }

}


/*
public addDisplayType(type: CellDisplayType){  
    this.content.insert(type) 
    this.color = this.getCurrentDisplayType().color
    //console.log(this.color);
}


public removeCurrentDisplayType(){
    this.content.pop()
    this.color = this.getCurrentDisplayType().color
}


public removeDisplayType(type: CellDisplayType){
    this.content.remove(type)
    this.color = this.getCurrentDisplayType().color
}


public removeDisplayTypeByIndex(index:number){
    this.content.removeByIndex(index)
    this.color = this.getCurrentDisplayType().color
}


public getCurrentDisplayType(){    
    return this.content.topDisplayType()
}
*/