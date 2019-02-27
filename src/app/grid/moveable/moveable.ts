import { Component } from '@angular/core';

import {CellType} from '../cell-type/cell-type';
import {Map} from '../map/map';
import {Cell} from "../cell/cell";
import {Position} from "../position/position";

@Component({
  selector: 'app-moveable'
})
export class Moveable {

  public position: Position;
  public currentCell: Cell;

  constructor(public map: Map, public cellType: CellType) { }

  public moveTo(position: Position){
    if (this.position !== undefined) {
      this.map.updateCellOnPosition(this.position, (cell: Cell) => {
        cell.type = CellType.Free;
        return cell;
      });
    }

    this.position = position;

    this.map.updateCellOnPosition(position, (cell: Cell) => {
        cell.type = this.cellType;
        this.currentCell = cell;
        console.log(cell);
        return cell;
    });
  }
}
