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

    constructor(public map: Map, public robotMap: Map, public cellType: CellType) {}

    get getPosition() {
        return this.position;
    }

    public moveTo(position: Position, moving: boolean = false){

        //Update der alten Zelle des Moveables
        //Wird beim ersten Platzieren des Moveables NICHT ausgeführt 
        if (this.position !== undefined) {
            
            //Update der FrontendMap
            this.map.updateCellOnPosition(this.position, 
                (cell: Cell) => {
                    cell.cellType = CellType.Free;
                    cell.removeCurrentDisplayType();
                    return cell;
                }
            ); 

            //Update der FilterMap für RoboterSichtradius
            this.robotMap.updateCellOnPosition(this.position, 
                (cell: Cell) => {
                    cell.cellType = CellType.Free;
                    cell.removeCurrentDisplayType();
                    return cell;
                }
            ); 
        }

        //Verschieben des Moveable
        this.position = position;

        //Update der neuen Zelle des Moveable
        //Update der FrontendMaps
        this.map.updateCellOnPosition(position, (cell: Cell) => {
            cell.cellType = this.cellType;

            if(this.cellType === CellType.Goal) {cell.addDisplayType(CellDisplayType.Goal)}
            if(this.cellType === CellType.Start) {cell.addDisplayType(CellDisplayType.Start)}
            if(this.cellType === CellType.Start && moving) {cell.addDisplayType(CellDisplayType.Robot)}        

            this.currentCell = cell;
            return cell;
        });
        //Update der FilterMap für RoboterSichtradius
        this.robotMap.updateCellOnPosition(position, (cell: Cell) => {
            cell.cellType = this.cellType;

            if(this.cellType === CellType.Goal) {cell.addDisplayType(CellDisplayType.Goal)}
            if(this.cellType === CellType.Start) {cell.addDisplayType(CellDisplayType.Start)}
            if(this.cellType === CellType.Start && moving) {cell.addDisplayType(CellDisplayType.Robot)}        

            this.currentCell = cell;
            return cell;
        });
    }
}
