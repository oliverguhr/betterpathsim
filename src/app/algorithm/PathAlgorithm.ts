import {Distance} from "./Distance";
import {Cell, Map, CellType, CellDisplayType} from "../grid/index";
import * as _ from "lodash";

export class PathAlgorithm {
    public distance: Function;
    public map: Map;
    constructor() {
        this.distance = Distance.euclid;
    }

    public paintShortestPath() {
        /*let node = this.map.getGoalCell().previous;
        while (node !== undefined) {
          if (node.isVisited) {
            node.type = CellType.Current;
            node.color = undefined;
          }
          node = node.previous;
        }*/
        this.map.cells.forEach(cell => cell.removeDisplayType(CellDisplayType.Path))
        let start = this.map.getStartCell();
        let node = this.map.getGoalCell();
        let nodeDistance = (cell: Cell) => cell.distance;
        do {
            let predecessors =
                this.getNeighbors(node, (cell: Cell) => !cell.isBlocked)
                    .filter(node => Number.isFinite(node.distance));

            if (predecessors.length === 0) { // deadend
                console.log("path is blocked");
                break;
            }

            node = _.minBy(predecessors, nodeDistance);
            if (node.isVisited) {
                node.type = CellType.Current;
                node.addDisplayType(CellDisplayType.Path)
            }
            // console.log("paint node"+ node.toString());
        } while (node !== start);
    }

    protected getNeighbors(cell: Cell, condition: (cell: Cell) => boolean) {

        let neighbors = new Array<Cell>();

        this.addCellIfPassable(cell.position.x + 0, cell.position.y - 1, neighbors, condition);
        this.addCellIfPassable(cell.position.x + 0, cell.position.y + 1, neighbors, condition);
        this.addCellIfPassable(cell.position.x + 1, cell.position.y + 0, neighbors, condition);
        this.addCellIfPassable(cell.position.x - 1, cell.position.y + 0, neighbors, condition);

        this.addCellIfPassable(cell.position.x + 1, cell.position.y + 1, neighbors, condition);
        this.addCellIfPassable(cell.position.x - 1, cell.position.y + 1, neighbors, condition);
        this.addCellIfPassable(cell.position.x + 1, cell.position.y - 1, neighbors, condition);
        this.addCellIfPassable(cell.position.x - 1, cell.position.y - 1, neighbors, condition);

        return neighbors;
    }

    private addCellIfPassable(x: number, y: number, neighbors: Cell[], condition: Function) {
        let cell = this.map.getCell(x, y);
        if (cell !== undefined && condition(cell)) {
            neighbors.push(cell);
        }
    }
}
