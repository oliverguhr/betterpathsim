import { Component } from '@angular/core';
import { _ } from 'underscore';

import {Cell} from '../cell/cell';
import {CellType} from '../cell-type/cell-type';
import {Position} from '../position/position';

@Component({
  selector: 'map'
})
export class Map {

  grid: Array< Array<Cell> >; // = Cell[][]
  private changeListener: Function[];

  constructor(public rows: number, public cols: number) { 
    this.grid = [ [], ];
    this.changeListener = new Array<(cell: Cell) => void>();
    this.initializeGrid();
  }

  /*##############################################
                Update-Funktionen
  ##############################################*/

  public updateCellOnPosition(position: Position, lambda: Function) {
    let updatedCell = lambda(this.getCell(position.x, position.y));
    this.updateCell(updatedCell);
  }

  public updateCell(cell: Cell) {
    this.grid[cell.position.y][cell.position.x] = cell;
    this.hasChanged(cell);
  }

  /*##############################################
                    Getter 
  ##############################################*/

  public getStartCell() {
    return this.cells.find(cell => cell.isStart);
  }
  public getGoalCell() {
    return this.cells.find(cell => cell.isGoal);
  }
  get cells() {
    return _.flatten(this.grid);
  }
  public getCell(x: number, y: number) {
    if(x >= 0 && y >= 0 && x < this.cols && y < this.rows) {
      return this.grid[y][x];
    } else {
      return undefined;
    }
  }
  public getIndexOfCell(cell: Cell) {
    return ((cell.position.y) * this.cols) + cell.position.x;
  }

  /*##############################################
                Pfad-Operationen
  ##############################################*/

  public resetPath() {
    this.cells.filter(cell => cell.isVisitid || cell.isCurrent).forEach(cell => {
      cell.type = CellType.Free;
      cell.color = undefined;
    })
  }
  public resetBlocks() {
    this.cells.filter(cell => cell.isBlocked).forEach(cell => {
      cell.type = CellType.Free;
      cell.color = undefined;
    })
  }

  /*##############################################
                Change-Listener
  ##############################################*/

  public notifyOnChange(lambda: (cell: Cell) => void) {
    this.changeListener.push(lambda);
  }

  public removeChangeListener(lambda: (cell: Cell) => void){
    console.log("old changeListener.length",this.changeListener.length);
    _.remove(this.changeListener, x => x === lambda);
    console.log("new changeListener.length",this.changeListener.length);
  }

  private hasChanged(updatedCell: Cell) {
    this.changeListener.forEach(changeListener => changeListener(updatedCell));
  }

  private initializeGrid() {
    for (let row = 0; row < this.rows; row++) {
      this.grid.push([]);
      for (let col = 0; col < this.cols; col++) {
          this.grid[row].push(new Cell(row, col));
      }
    }
    /*
    for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
            console.log(this.grid[row][col].position.x);
        }
      }
    */
    console.log("Grid initialized");
  }
}
