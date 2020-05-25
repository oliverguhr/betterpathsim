import {PathAlgorithm} from "./PathAlgorithm";
import {Cell, Map, CellType} from "../grid/index";
import * as _ from "lodash";

export class Dijkstra extends PathAlgorithm {
    private cells: Cell[];

    constructor(map: Map) {
        super();
        this.map = map;
        this.cells = [];
        this.initialize();
    }

    public initialize() {
        let cells = this.map.cells.filter(cell => !cell.isBlocked);
        for (let cell of cells) {
            cell.previous = undefined;
            cell.distance = Number.POSITIVE_INFINITY;
            this.cells.push(cell);
        }

        this.map.getStartCell().distance = 0;
    }

    public run() {
        while (this.step()) {}
    }

    public step() {
        let isRunning = true;
        let currentCell = _.minBy(this.cells, c => c.distance);

        if (currentCell.isGoal) {
            this.paintShortestPath();
            return false;
        }

        _.pull(this.cells, currentCell);

        let neighbors = this.getNeighbors(currentCell, (cell: Cell) => !cell.isBlocked && !cell.isVisited);

        for (let neighbor of neighbors) {
            if (isRunning) {
                this.updateDistance(currentCell, neighbor);
            }
            if (neighbor.isGoal) {
                this.paintShortestPath();
                isRunning = false;
                break;
            }
        }
        return isRunning;
    }

    private updateDistance(previousCell: Cell, currentCell: Cell) {
        let distance = previousCell.distance + this.distance(previousCell, currentCell);
        if (distance < currentCell.distance) {
            currentCell.distance = distance;
            currentCell.previous = previousCell;
        }
        if (currentCell.isFree) {
            currentCell.type = CellType.Visited;
        }
    }
}
