import { Component, OnInit, Input } from '@angular/core';

import { Map, Moveable, CellType, Position, Cell } from "../grid/index";
import { LpaStar, AStar, Dijkstra, Distance, MPGAAStar, GAAStar } from "../algorithm/index";

import { DynmicObstacleGenerator, PathCostVisualizer, ObstacleGenerator, MazeGenerator } from '../tools';

@Component({
  selector: 'app-assembler',
  templateUrl: './assembler.html',
  styleUrls: ['./assembler.css']
})
export class Assembler implements OnInit {

    name: String; 

    //######################################
    //      Variablen der Algorithmen
    //######################################

    //robots: DynmicObstacleGenerator;
    robots: any;
    algorithm: string;
    algorithmInstance: any;
    distance: string;
    isVisualizePathEnabled: boolean;

    robotStepInterval: number;
    robotIntervall: any;

    editStartCell: boolean;
    editGoalCell: boolean;

    //######################################
    //      Variablen der Map
    //######################################

    map: Map;
    stat: any;
    start: any;
    goal: any;
    cellSize: number;
    widthPx: number;
    heightPx: number;

    robotIsMoving: any;

    hoveredCell: any;

    @Input() cols :number;
    @Input() rows :number;

    constructor() { 
    }

    ngOnInit() {
        
        console.log(this.cols, this.rows);
        
        let map = this;
        
        map.name = "test";
        map.cols = this.cols;
        map.rows = this.rows;
        map.robots = undefined;
        map.algorithm = "MPGAAStar";
        map.algorithmInstance = undefined;
        map.distance = "euklid";
        map.isVisualizePathEnabled = true;
        map.stat = {};
        map.start = undefined;
        map.goal = undefined;
    
        //###########################################################
        //  this.map.initializeMap();  -- Map-Initialisierung
        //###########################################################

        map.map = new Map(map.rows, map.cols);
    
        map.start = new Moveable(map.map, CellType.Start);
        map.start.moveTo(new Position(Math.round(map.cols / 4), Math.round(map.rows / 2)));
    
        map.goal = new Moveable(map.map, CellType.Goal);
        map.goal.moveTo(new Position(Math.round((map.cols / 4) * 3), Math.round(map.rows / 2)));
    
        map.cellSize = 25;
        map.widthPx = map.map.cols * map.cellSize;
        map.heightPx = map.map.rows * map.cellSize;

        console.log(map.widthPx, map.heightPx);

        map.map.notifyOnChange((cell: Cell) => {
            if (map.robotIsMoving) {
                return;
            }
    
            try {
                map.algorithmInstance = map.getAlgorithmInstance();
            } catch (e) {
                console.error(e);
                return;
            }
            map.map.resetPath();
            if (map.algorithmInstance.isInitialized) {
                console.time(map.algorithm);
                map.algorithmInstance.mapUpdate([cell]);
                console.timeEnd(map.algorithm);
                map.visualizePathCosts();
                map.calculateStatistic();
            }
            if (map.algorithmInstance.isInitialized === undefined || map.algorithmInstance.isInitialized === false) {
                map.calculatePath();
            }
        });

        this.robotStepInterval = 500;
        this.robotIsMoving = false;        

        this.editStartCell = false;
        this.editGoalCell = false;

         
    };

    //######################################
    //      Funktionen der App
    //######################################

    getAlgorithmInstance = () => {
        let algorithm: any;
        switch (this.algorithm) {
            case "Dijkstra":
                algorithm = new Dijkstra(this.map);
                break;
            case "LpaStar":
                if (this.algorithmInstance instanceof LpaStar) {
                    algorithm = this.algorithmInstance;
                } else {
                    algorithm = new LpaStar(this.map);
                }
                break;
            case "AStar":
                algorithm = new AStar(this.map);
                break;
            case "GAAStar":
                algorithm = new GAAStar(this.map, 500);
                break;
            default:
                algorithm = new MPGAAStar(this.map, 500);
                break;
        }
    
        switch (this.distance) {
            case "manhattan":
                algorithm.distance = Distance.manhattan;
                break;
            case "diagonalShortcut":
                algorithm.distance = Distance.diagonalShortcut;
                break;
            default:
                algorithm.distance = Distance.euclid;
        }
    
        this.algorithmInstance = algorithm;
        return algorithm;
    };

    visualizePathCosts = () => {
        if (this.isVisualizePathEnabled === true) {
            let visual = new PathCostVisualizer(this.map);
            visual.paint();
        }
    };

    calculateStatistic = () => {
        this.stat.pathLength = this.map.cells.filter((x: Cell) => x.isCurrent).length;
        this.stat.visitedCells = this.stat.pathLength + this.map.cells.filter((x: Cell) => x.isVisited).length;
    };

    calculatePath = () => {
        let pathFinder = this.getAlgorithmInstance();
        if (pathFinder.isInitialized === undefined || pathFinder.isInitialized === false) {
            console.time(this.algorithm);
            // console.profile("Dijkstra");
            pathFinder.run();
            // console.profileEnd("Dijkstra");
            console.timeEnd(this.algorithm);
        }
        this.visualizePathCosts();
        this.calculateStatistic();
    };

    cleanMap = () => {
        this.algorithmInstance = undefined;
        this.map.resetPath();
        this.map.resetBlocks();
        this.clearRobots();
    };
    
    runStepByStep = () => {
        this.map.resetPath();
        this.clearRobots();
        let pathFinder = this.getAlgorithmInstance();

        let interval = setInterval( () => {
            if (!pathFinder.step()) {
                clearTimeout(interval);
            } else {
                this.visualizePathCosts();
            }
            this.calculateStatistic();
        }, 10);
    };

    startRobot = () => {
        this.robotIsMoving = true;
        this.map.resetPath();
        let pathFinder = this.getAlgorithmInstance();

        let onMapUpdate = (cell: Cell) => { pathFinder.observe(cell) };
        this.map.notifyOnChange(onMapUpdate);

        let start = this.map.getStartCell() as Cell;
        let goal = this.map.getGoalCell();
        let lastPosition:Cell;

        let interval = setInterval (() => {
            //cleanup old visited cells, to show which cells are calculated by the algorithm 
            this.map.cells.filter((x:Cell) => x.isVisited).forEach((x:Cell) =>{ x.type = CellType.Free; x.color = undefined});
            
            let nextCell = pathFinder.calculatePath(start, goal) as Cell;            
            start = nextCell;
            if (start.isGoal) {

                clearTimeout(interval);
                this.map.removeChangeListener(onMapUpdate);
                this.robotIsMoving = false;
            } else {
                this.visualizePathCosts();
                if(lastPosition !== undefined)
                {
                    lastPosition.cellType = CellType.Free;
                    lastPosition.color = undefined;
                }

                nextCell.cellType = CellType.Visited;
                nextCell.color = "#ee00f2";
                lastPosition=nextCell;
                
            }
            this.calculateStatistic();

        }, this.robotStepInterval);
    }

    addRandomObstacles = () => {
        this.map.resetPath();
        this.algorithmInstance = undefined;
        let generator = new ObstacleGenerator(this.map);
        generator.addRandomObstacles((this.map.cols * this.map.rows) * 0.1);
        this.algorithmInstance = this.getAlgorithmInstance();
        this.calculatePath();
    };

    addWalls = () => {
        this.map.resetPath();
        this.algorithmInstance = undefined;
        let generator = new MazeGenerator(this.map);
        generator.createMaze();
        this.algorithmInstance = this.getAlgorithmInstance();
        this.calculatePath();
    };

    addDynamicObstacle = () => {
        if (this.robots === undefined) {
            this.robots = new DynmicObstacleGenerator(this.map);
        }
        this.robots.add();

        if (this.robotIntervall !== undefined) {
            clearTimeout(this.robotIntervall);
        }

        this.robotIntervall =setInterval( () => {
            this.robots.update();
        }, 800);
    };

    clearRobots = () => {
        clearTimeout(this.robotIntervall);
        if (this.robots !== undefined) {

            //robots von DynmicObstacleGenerator ist privat .. -> statischer Zugriff so nicht möglich
            this.robots.robots.forEach(
                (robot: Cell) => this.map.getCell(robot.position.x, robot.position.y).cellType = 0
            );
        }
        this.robots = undefined;
    };

    clickOnCell = (cell: Cell) => {
        if (this.editStartCell) {
            this.start.moveTo(cell.position);
            this.editStartCell = false;
        } else if (this.editGoalCell) {
            this.goal.moveTo(cell.position);
            this.editGoalCell = false;
        } else {
            switch (cell.type) {
                case CellType.Blocked:
                    cell.type = CellType.Free;
                    break;
                case CellType.Current:
                case CellType.Visited:
                case CellType.Free:
                    cell.color = undefined;                   
                    cell.type = CellType.Blocked;
                    break;
                case CellType.Start:
                    this.editStartCell = true;
                    break;
                case CellType.Goal:
                    this.editGoalCell = true;
                    break;
                default:
            }
            this.map.updateCell(cell);
        }
    };

    mouseOverCell = (cell: Cell, event: any) => {
        if (event.buttons === 1) {
            this.clickOnCell(cell);
        }

        this.stat.cell = cell.toString();
        this.hoveredCell = cell;
    };

    changeAlgorithm = () => {
        this.algorithmInstance = undefined;
        this.algorithmInstance = this.getAlgorithmInstance();
        this.map.resetPath();
        this.calculatePath();
    };

}


