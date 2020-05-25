import { Component } from '@angular/core';
import { _ } from 'underscore';

import {Cell} from '../cell/cell';
import {CellType} from '../cell-type/cell-type';
import {Position} from '../position/position';
import { CellDisplayType } from '..';
import { Assembler } from 'src/app/assembler/assembler';

@Component({
  selector: 'map'
})
export class Map {

    grid: Array< Array<Cell> >; // = Cell[][]
    private changeListener: Array<(cell: Cell) => void>;

    viewRadiusX: number;
    viewRadiusY: number;
    viewRadiusR: number;

    constructor(public rows: number, public cols: number, public robotRadius: number) { 
        this.grid = [ [], ];
        this.changeListener = new Array<(cell: Cell) => void>();
        this.initializeGrid();

        this.viewRadiusX = 0;
        this.viewRadiusY = 0;
        this.viewRadiusR = 0;
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

    public updateCells(cells: Cell[]) {
        let lastCell;
        cells.forEach( (eachCell) => {
            let position = eachCell.getPosition;
            this.grid[position.y][position.x] = eachCell;
            lastCell = eachCell;
        });

        this.hasChanged(lastCell);
    }

    public resetHeuristics() {
        this.cells.forEach(eachCell => eachCell.removeDisplayTypeByIndex(300));
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

    get cells():Cell[] {
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
        this.cells.filter(cell => cell.isVisited || cell.isCurrent).forEach(cell => {
            cell.type = CellType.Free;
            cell.color = undefined;
            
            cell.removeDisplayType(CellDisplayType.Path);
            cell.removeDisplayType(CellDisplayType.Start);

        });
    }

    public resetBlocks() {
        this.cells.filter(cell => cell.isBlocked).forEach(cell => {
            cell.type = CellType.Free;
            cell.removeDisplayType(CellDisplayType.Wall);
            cell.removeDisplayType(CellDisplayType.UnknownWall);
        })
    }

    public resettKnowledge() {
        this.cells.filter(cell => cell.isBlocked).forEach(cell => {
            cell.removeDisplayType(CellDisplayType.Wall);
            cell.removeDisplayType(CellDisplayType.UnknownWall);

            cell.addDisplayType(CellDisplayType.UnknownWall);
        })
    }

    public drawViewRadius(start: Cell) {
        //Resetten des Alten Sichtradius
        this.viewRadiusX = 0;
        this.viewRadiusY = 0;
        this.viewRadiusR = 0;

        //Abbruch wenn ViewRadius ausgeschalten
        if(this.robotRadius == Assembler.robotViewRadiusOff) {
            return;
        }

        //Zeichnen des neuen Sichtradius
        this.viewRadiusX = (start.position.x*25) + 25/2;
        this.viewRadiusY = (start.position.y*25) + 25/2;
        this.viewRadiusR = (this.robotRadius*25) + 25/2;
    }

    public checkCellInView (cell: Cell, start:Cell) {
        return  cell.position.x >= start.position.x - this.robotRadius && 
                cell.position.x <= start.position.x + this.robotRadius && 
                cell.position.y >= start.position.y - this.robotRadius && 
                cell.position.y <= start.position.y + this.robotRadius;
    }

    public resetKnownWalls() {
        this.cells.filter(cell => cell.isBlocked).forEach(cell => {
            cell.removeDisplayType(CellDisplayType.Wall); 
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
        this.changeListener = this.changeListener.filter(x => x === lambda);
        console.log("new changeListener.length",this.changeListener.length);
    }

    private hasChanged(updatedCell: Cell) {
        this.changeListener.forEach( (eachFunction) => eachFunction(updatedCell) );
    }

    private initializeGrid() {
        for (let row = 0; row < this.rows; row++) {
            this.grid.push([]);
            for (let col = 0; col < this.cols; col++) {
                this.grid[row].push(new Cell(row, col));
            }
        }
    }
}

