import * as _ from "lodash";
import { Map, CellType, Cell, Position, CellDisplayType } from "../grid/index";

export class MazeGenerator {
    constructor(private map: Map) { }

    public createMaze(walls = 5, minDistanceBetweenWalls = 5) {
        for (let i = 0; i < walls; i++) {
            this.generateRandomWall(minDistanceBetweenWalls);
        }
    }

    private generateRandomWall(minDistanceBetweenWalls: number) {
        // will this be a vertical line or a horizontal
        let vertical = _.random(0, 1);

        let stepsY = this.map.rows / minDistanceBetweenWalls;
        let stepsX = this.map.cols / minDistanceBetweenWalls;

        let y = Math.round((this.map.rows / stepsY) * _.random(1, stepsY - 1));
        let x = Math.round((this.map.cols / stepsX) * _.random(1, stepsX - 1));

        let postionStart: Position;
        let postionEnd: Position;
        if (vertical === 1) {
            postionStart = new Position(0, y);
            postionEnd = new Position(this.map.cols, y);
        } else {
            postionStart = new Position(x, 0);
            postionEnd = new Position(x, this.map.rows);
        }

        this.drawWall(postionStart, postionEnd);
    }

    private drawWall(positionStart: Position, positionEnd: Position) {
        let diffX = positionEnd.x - positionStart.x;
        let diffY = positionEnd.y - positionStart.y;
        let lastDoor = 0;

        let cell: Cell;

        //Horizontale Wände
        for (let i = 0; i < diffX; i++) {
            cell = this.map.grid[positionStart.y][positionStart.x + i];
            if (cell.isBlockable) {

                cell.type = CellType.Blocked;
                cell.addDisplayType(CellDisplayType.UnknownWall);

            } else if (cell.isBlocked) {
                // add a door
                
                let distance = _.random(lastDoor, i - 1);

                this.map.grid[positionStart.y][positionStart.x + distance].type = CellType.Free;
                this.map.grid[positionStart.y][positionStart.x + distance].removeDisplayType(CellDisplayType.UnknownWall);
                this.map.grid[positionStart.y][positionStart.x + distance].removeDisplayType(CellDisplayType.Wall);
                
                lastDoor = i;
                // throw a coin if we go ahead or stop here
                if (_.random(0, 1) === 1) {
                    break;
                }
            }

        }
        lastDoor = 0;

        //Vertikale Wände
        for (let i = 0; i < diffY; i++) {
            cell = this.map.grid[positionStart.y + i][positionEnd.x];
            if (cell.isBlockable) {

                cell.type = CellType.Blocked;
                cell.addDisplayType(CellDisplayType.UnknownWall);
            
            } else if (cell.isBlocked) {
                // add a door
                // if(diffY!==0)
                
                let distance = _.random(lastDoor, i - 1);

                this.map.grid[positionStart.y + distance][positionEnd.x].type = CellType.Free;
                this.map.grid[positionStart.y + distance][positionEnd.x].removeDisplayType(CellDisplayType.UnknownWall);
                this.map.grid[positionStart.y + distance][positionEnd.x].removeDisplayType(CellDisplayType.Wall);

                lastDoor = i;
                // throw a coin if we go ahead or stop here
                if (_.random(0, 1) === 1) {
                    break;
                }
            }
        }
    }

}
