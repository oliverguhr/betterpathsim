import { Component } from '@angular/core';

import {CellType} from '../cell-type/cell-type';
import {Map} from '../map/map';
import {Cell} from "../cell/cell";
import {Position} from "../position/position";
import CellDisplayType from '../cell-display-type/cell-display-type';

@Component({
  selector: 'app-moveable'
})
export class Moveable {

  public position: Position;
  public currentCell: Cell;

  constructor(public map: Map, public cellType: CellType) {}

  public moveTo(position: Position){
    if (this.position !== undefined) {
      this.map.updateCellOnPosition(this.position, (cell: Cell) => {
        cell.cellType = CellType.Free;

        cell.removeCurrentDisplayType()

        return cell;
      });
    }

    this.position = position;
    this.map.updateCellOnPosition(position, (cell: Cell) => {
        cell.cellType = this.cellType;

        //debugger;
        if(this.cellType === CellType.Goal) {cell.addDisplayType(CellDisplayType.Goal)}
        if(this.cellType === CellType.Start) {cell.addDisplayType(CellDisplayType.Start)}        

        this.currentCell = cell;
        return cell;
    });
  }
}
