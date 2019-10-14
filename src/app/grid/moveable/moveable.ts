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

    /*
        Update der alten Zelle des Moveables
        Wird beim ersten Platzieren des Moveables NICHT ausgeführt
    */

    console.log("erstes Update - Freigeben der alten Zelle des Moveable.");

    if (this.position !== undefined) {
        this.map.updateCellOnPosition(this.position, 
        (cell: Cell) => {
            //cell.cellType = this.cellType;

            cell.cellType = 0;

            cell.removeCurrentDisplayType();
            return cell;
        }
        );  
    }

    //Verschieben des Moveable
    this.position = position;

    /*
        Update der neuen Zelle des Moveable
    */

   console.log("zweites Update - Belegen der neuen Zelle des Moveable");

    this.map.updateCellOnPosition(position, (cell: Cell) => {
        cell.cellType = this.cellType;

        //debugger;
        if(this.cellType === CellType.Goal) {cell.addDisplayType(CellDisplayType.Goal)}
        if(this.cellType === CellType.Start) {cell.addDisplayType(CellDisplayType.Start)}        

        this.currentCell = cell;
        return cell;
    });

    if(this.cellType == 4)
    console.log("neue Position der Startzelle: "+this.position);
    else if(this.cellType == 5)
    console.log("neue Position der Zielzelle: "+this.position);
  }
}
