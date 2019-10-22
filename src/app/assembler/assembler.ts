import { Component, OnInit, Input } from '@angular/core';

import { Map, Moveable, CellType, Position, Cell, CellDisplayType } from "../grid/index";
import { LpaStar, AStar, Dijkstra, Distance, MPGAAStar, GAAStar } from "../algorithm/index";

import { DynmicObstacleGenerator, PathCostVisualizer, ObstacleGenerator, MazeGenerator } from '../tools';
import { debug } from 'util';
import { IfStmt } from '@angular/compiler';

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
    robotViewRadius: number;
    robotIntervall: any;

    editStartCell: boolean;
    editGoalCell: boolean;

    //######################################
    //      Variablen der Map
    //######################################

    map: Map;               //AnzeigeMap (mit allen Infos)
    robotMap: Map;          //Filtermap für Sichtradius des Roboters (nur mit Infos im Sichtradius)

    stat: any;
    start: any;
    goal: any;
    robot: any;
    cellSize: number;
    widthPx: number;
    heightPx: number;

    robotIsMoving: any;

    hoveredCell: any;

    //Variablen zur Berechnung ob Zellposition im Sichtradius
    cellX: number;
    cellY: number;
    robotX: number;
    robotY: number;
    dist: number;

    @Input() cols :number;
    @Input() rows :number;

    constructor() { 
    }

    ngOnInit() {
        
        let map = this;
        
        map.name = "test";
        map.robots = undefined;
        map.algorithm = "MPGAAStar";
        map.algorithmInstance = undefined;
        map.distance = "euklid";
        map.isVisualizePathEnabled = true;
        map.stat = {};
        map.start = undefined;
        map.goal = undefined;
        map.robot = undefined;

        //###########################################################
        //  this.map.initializeMap();  -- Map-Initialisierung
        //###########################################################

        this.robotViewRadius = 5;

        this.map = new Map(this.rows, this.cols, this.robotViewRadius);
        this.robotMap = new Map(this.rows, this.cols, this.robotViewRadius);

        map.start = new Moveable(this.map, this.robotMap, CellType.Start);
        map.start.moveTo(new Position(Math.round(map.cols / 4), Math.round(map.rows / 2)));
        map.goal = new Moveable(this.map, this.robotMap, CellType.Goal);
        map.goal.moveTo(new Position(Math.round((map.cols / 4) * 3), Math.round(map.rows / 2)));
        
        map.cellSize = 25;
        map.widthPx = map.map.cols * map.cellSize;
        map.heightPx = map.map.rows * map.cellSize;

        this.robotMap.notifyOnChange(
            (cell: Cell) => {   
                //Initialisieren des Algorithmus       
                try {
                    map.algorithmInstance = map.getAlgorithmInstance();
                } catch (e) {
                    console.error(e);
                    return;
                }

                //Rücksetzen des alten Pfades
                map.map.resetPath();
                map.robotMap.resetPath();

                if (map.algorithmInstance.isInitialized) {
                    console.time(map.algorithm);

                    map.algorithmInstance.mapUpdate([cell]);

                    console.timeEnd(map.algorithm);
                    map.visualizePathCosts();
                    map.calculateStatistic();
                } 
                if (map.algorithmInstance.isInitialized === undefined || map.algorithmInstance.isInitialized === false) {
                    if(this.map.getStartCell() !== undefined && this.map.getGoalCell() !== undefined) {
                        map.calculatePath();
                    }     
                    else {
                        //Abbruch falls erstes Update bei Umplatzierung des Start- oder Zielpunktes
                    }      
                }
            }
        );

        this.robotStepInterval = 500;
        this.robotIsMoving = false;        

        this.editStartCell = false;
        this.editGoalCell = false;

        this.hoveredCell = new Cell(0,0,CellType.Free);
    };

    //######################################
    //      Funktionen der App
    //######################################

    getAlgorithmInstance = () => {
        let algorithm: any;
        switch (this.algorithm) {
            case "Dijkstra":
                algorithm = new Dijkstra(this.robotMap);
                break;
            case "LpaStar":
                if (this.algorithmInstance instanceof LpaStar) {
                    algorithm = this.algorithmInstance;
                } else {
                    algorithm = new LpaStar(this.robotMap);
                }
                break;
            case "AStar":
                algorithm = new AStar(this.robotMap);
                break;
            case "GAAStar":
                algorithm = new GAAStar(this.robotMap, this.map);
                break;
            default:
                algorithm = new MPGAAStar(this.robotMap, this.map);
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
            //let visual = new PathCostVisualizer(this.robotMap);
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
           // console.time(this.algorithm);
            // console.profile("Dijkstra");
            pathFinder.run();
            // console.profileEnd("Dijkstra");
           // console.timeEnd(this.algorithm);
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

    updateMapsInRadius = () => {
        let mapCells = this.map.cells;
        let changedCells = [];
        mapCells.forEach( (eachCell) => {
            let position = eachCell.getPosition;

            let distance = Distance.euclid(eachCell,this.start) - 1
            if(distance <= this.map.robotRadius) {
                let robotMapCell = this.robotMap.getCell(position.x,position.y);
                robotMapCell.type = eachCell.type;
                //Anpassen des Display Types der blockierten Zellen: unknwonWall -> Wall
                if(eachCell.type == CellType.Blocked) eachCell.addDisplayType(CellDisplayType.Wall);
                
                changedCells.push(robotMapCell);
            }
        });
        this.robotMap.updateCells(changedCells)
    }

    startRobot = () => {

        this.robotIsMoving = true;
        this.map.resetPath();
        let pathFinder = this.getAlgorithmInstance();

        let start = this.map.getStartCell() as Cell;
        let goal = this.map.getGoalCell();
        let lastPosition:Cell;

        this.map.drawViewRadius(start);

        let interval = setInterval (() => {

            console.log("=================== STEP =======================")
            let nextCell = pathFinder.calculatePath(start, goal) as Cell;

            this.map.drawViewRadius(nextCell);
            this.updateMapsInRadius();

            if (nextCell.isGoal) {              //Code für letzten Schritt
                clearTimeout(interval);
                this.robotIsMoving = false;
                this.start.moveTo(nextCell.position, true);
        
               //this.map.cells.filter((x:Cell) => x.isVisited).forEach((x:Cell) =>{ x.type = CellType.Free; x.color = undefined});

                console.log("jo")
            } else {                            //Code für Zwischenschritt
                console.log("hey")
                this.visualizePathCosts();
                if(lastPosition !== undefined)
                {
                    lastPosition.cellType = CellType.Free;
                    lastPosition.color = undefined;
                }

                nextCell.cellType = CellType.Visited;
                nextCell.color = "#ee00f2";
                lastPosition=nextCell;

                this.start.moveTo(nextCell.position, true);
                
            }
            this.calculateStatistic();

            //Startposition weitersetzen für nächste Itteration -- wenn das nicht passiert, wird der Suchalgorithmus immer wieder von der selben Position aus gestartet
            start = nextCell;

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
            this.robots = new DynmicObstacleGenerator(this.map, this.robotMap);
        }
        this.robots.add();

        if (this.robotIntervall !== undefined) {
            clearTimeout(this.robotIntervall);
        }

        this.robotIntervall = setInterval( () => {
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

    synchronizeRobotMap = (cell: Cell) => {
        let position = cell.getPosition;

        let distance = Distance.euclid(cell,this.start) - 1
        if(distance <= this.map.robotRadius) {
            let robotMapCell = this.robotMap.getCell(position.x,position.y);
            robotMapCell.type = cell.type;
            //Anpassen des Display Types der blockierten Zellen: unknwonWall -> Wall
            if(cell.type == CellType.Blocked) cell.addDisplayType(CellDisplayType.Wall);
            
            this.robotMap.updateCell(robotMapCell);
        }
    };

    clickOnCell = (cell: Cell) => {

        let i=0;

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
                    cell.removeCurrentDisplayType()

                    /*
                    cell.addDisplayType(CellDisplayType.Path)

                    console.log(cell.currentContent);
                    cell.currentContent.forEach( (eachContent) => {
                        console.log(i)
                        console.log(eachContent);
                        i++;
                    })

                    //cell.removeCurrentDisplayType()
                    */
                    this.synchronizeRobotMap(cell);

                    break;
                case CellType.Current:
                case CellType.Visited:
                case CellType.Free:   
                    //todo: add new method to cell   
                    // debugger                          
                    cell.type = CellType.Blocked;                    
                    cell.addDisplayType(CellDisplayType.UnknownWall)
                    /*
                    console.log(cell.currentContent);
                    cell.currentContent.forEach( (eachContent) => {
                        console.log(i)
                        console.log(eachContent);
                        i++;
                    })
                    */
                    this.synchronizeRobotMap(cell);

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

    showViewRadius = () => {
        this.map.robotRadius = this.robotViewRadius;
    }

}


