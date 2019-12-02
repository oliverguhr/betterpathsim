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
    robotViewRadiusSetting: number;
    robotViewRadius: number;
    robotIntervall: any;

    static robotViewRadiusOff = 100;

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

    startSaving: any;
    goalSaving: any;
    interval: any;

    robotIsMoving: any;
    robotHasMoved = false;
    robotHasFinished = false;

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
        this.robotViewRadiusSetting = this.robotViewRadius;

        //Initialisieren der Maps
        this.map = new Map(this.rows, this.cols, this.robotViewRadius);
        this.robotMap = new Map(this.rows, this.cols, this.robotViewRadius);

        //Initialisieren des Starts und Ziels
        map.start = new Moveable(this.map, this.robotMap, CellType.Start);
        map.start.moveTo(new Position(Math.round(map.cols / 4), Math.round(map.rows / 2)));
        map.goal = new Moveable(this.map, this.robotMap, CellType.Goal);
        map.goal.moveTo(new Position(Math.round((map.cols / 4) * 3), Math.round(map.rows / 2)));
        
        //Vorhalten des Ursprünglichen Starts und Ziels für Mapresett
        this.startSaving = this.start;
        this.goalSaving = this.goal;

        this.map.drawViewRadius(this.start);

        map.cellSize = 25;
        map.widthPx = map.map.cols * map.cellSize;
        map.heightPx = map.map.rows * map.cellSize;

        //Change-Handler für Änderungen auf der Map
        this.robotMap.notifyOnChange(
            (cell: Cell) => {  
                
                if (map.robotIsMoving) {
                    return;
                }
                
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
                        
                        this.calculatePath();
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
                this.robotViewRadius = Assembler.robotViewRadiusOff;
                algorithm = new Dijkstra(this.map);
                break;
            case "LpaStar":
                this.robotViewRadius = Assembler.robotViewRadiusOff;
                if (this.algorithmInstance instanceof LpaStar) {
                    algorithm = this.algorithmInstance;
                } else {
                    algorithm = new LpaStar(this.map);
                }
                break;
            case "AStar":
                this.robotViewRadius = Assembler.robotViewRadiusOff;
                algorithm = new AStar(this.map);
                break;
            case "GAAStar":
                this.robotViewRadius = this.robotViewRadiusSetting;
                algorithm = new GAAStar(this.robotMap, this.map);
                break;
            default:
                this.robotViewRadius = this.robotViewRadiusSetting;
                algorithm = new MPGAAStar(this.robotMap, this.map);
                break;
        }
        
        //Neuzeichnen des Radius nach Wahl eines Algorithmus -- zur Deaktivierung, falls Algorithmus ohne Radius
        this.map.robotRadius = this.robotViewRadius;
        this.map.drawViewRadius(this.start);

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

        this.clearRobots();
        this.resettRobot();

        this.map.resetPath();
        this.map.resetBlocks();
        
        this.start.moveTo(new Position(Math.round(this.cols / 4), Math.round(this.rows / 2)));
        this.goal.moveTo(new Position(Math.round((this.cols / 4) * 3), Math.round(this.rows / 2)));
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

        let start = this.map.getStartCell();
        let goal = this.map.getGoalCell();

        mapCells.forEach( (eachCell) => {
            //Zellen prüfen, ob in Sichtradius des Roboters
            let position = eachCell.getPosition;
            let distance = Distance.euclid(eachCell,this.start) - 1;
            let robotMapCell = this.robotMap.getCell(position.x,position.y);

            if(distance <= this.map.robotRadius) {
                //Resetten des angezeigten Wissens
                eachCell.removeDisplayType(CellDisplayType.OldWall);
                eachCell.removeDisplayType(CellDisplayType.UnknownWall);
                eachCell.removeDisplayType(CellDisplayType.Wall);

                //Synchronisieren der Zellen
                robotMapCell.type = eachCell.type;

                //Anzeigen des neuen Wissens
                if(eachCell.type == CellType.Blocked) eachCell.addDisplayType(CellDisplayType.Wall);
                
                //Übertragen des Wissens an Algorithmen-Map
                changedCells.push(robotMapCell);
            } else {
                if(robotMapCell.type == CellType.Blocked && eachCell.type == CellType.Free) 
                    eachCell.addDisplayType(CellDisplayType.OldWall);
            }
        });
        this.robotMap.updateCells(changedCells);
        this.algorithmInstance.observe(changedCells);
    }

    startRobot = (first: boolean = true) => {

        this.robotIsMoving = true;
        this.robotHasFinished = false;

        this.map.resetPath();
        let pathFinder = this.getAlgorithmInstance();

        let start = this.map.getStartCell() as Cell;
        let goal = this.map.getGoalCell();

        let nextCell = start;

        if(first){
            this.startSaving = start;
            this.goalSaving = goal;
            this.robotHasMoved = true;
        } 
        this.map.drawViewRadius(start);

        this.interval = setInterval (() => {        //Startet den Roboter

            if(start.isGoal) {
                clearTimeout(this.interval);

                this.robotIsMoving = false;
                this.robotHasFinished = true;

                this.start.moveTo(nextCell.position, true); 
                
                //Heuristiken entfernen
                this.map.cells.forEach((x:Cell) =>{ x.removeDisplayTypeByIndex(300)});

                return;
            }

            this.start.moveTo(nextCell.position, true); 
            nextCell = pathFinder.calculatePath(start, goal) as Cell;

            //Sichtradius zeichnen und Maps synchronisieren
            this.map.drawViewRadius(start);
            this.updateMapsInRadius();

            //Heuristiken entfernen
            this.map.cells.forEach((x:Cell) =>{ x.removeDisplayTypeByIndex(300)});
            //Heuristiken neu zeichnen -- arbeitet nur, wenn Zellen durch AStar als "visited" markiert sind
            this.visualizePathCosts(); 
        
            this.calculateStatistic();

            //Startposition weitersetzen für nächste Itteration -- wenn das nicht passiert, wird der Suchalgorithmus immer wieder von der selben Position aus gestartet
            start = nextCell;
        }, this.robotStepInterval);
    }

    stopRobot = () => {                             //Stoppt den Roboter
        //Timer stoppen                         
        this.robotIsMoving = false;
        clearTimeout(this.interval);
    }

    resettRobot = () => {                           //Setzt den Roboter auf den Ausgang seines letzten Startes zurück
        //Timer stoppen
        this.robotIsMoving = false;
        this.robotHasFinished = false;
        clearTimeout(this.interval);
        
        //Wissen zurücksetzen
        this.robotMap.resetBlocks();
        this.map.resettKnowledge(); 

        //Ausgangspositionen wiederherstellen
        this.start.moveTo(this.startSaving.position, false);
        this.goal.moveTo(this.goalSaving.position, false);

        //Sichtradius synchronisieren
        this.updateMapsInRadius();

        //Start-Button wieder anezigen
        this.robotHasMoved = false;     
    }

    restartRobot = () => {
        console.log(this.goalSaving.position);
        this.goal.moveTo(this.goalSaving.position, false);                          
        this.startRobot(false);
    }

    addRandomObstacles = () => {
        //Rücksetzen des berechneten Pfades
        this.map.resetPath();
        this.algorithmInstance = undefined;

        //Generieren von Hindernisen
        let generator = new ObstacleGenerator(this.map);
        generator.addRandomObstacles((this.map.cols * this.map.rows) * 0.1);

        //Update für Sichtradius
        this.updateMapsInRadius();
        
        //Neuberechnen des Pfades
        this.algorithmInstance = this.getAlgorithmInstance();
        this.calculatePath();
    };

    addWalls = () => {
        //Rücksetzen des berechneten Pfades
        this.map.resetPath();
        this.algorithmInstance = undefined;

        let generator = new MazeGenerator(this.map);
        generator.createMaze();

        //Update für Sichtradius
        this.updateMapsInRadius();

        //Neuberechnen des Pfades
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
                (robot: Cell) => this.map.getCell(robot.position.x, robot.position.y).cellType = CellType.Free
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
            
            //Entfernen des DisplayTypes wenn Zelle Frei -> muss später angepasst werden auf Typen für Zellen, die Roboter dort gesehen hat aber die nicht mehr da sind
            else if(cell.type == CellType.Free) {
                cell.removeDisplayType(CellDisplayType.Wall);
                cell.removeDisplayType(CellDisplayType.UnknownWall);
            }

            this.robotMap.updateCell(robotMapCell);
        }
    };

    clickOnCell = (cell: Cell) => {

        let i=0;

        if (this.editStartCell) {

            this.start.moveTo(cell.position);
            this.showViewRadius();
            this.editStartCell = false;

        } else if (this.editGoalCell) { 

            this.goal.moveTo(cell.position);
            this.goalSaving = cell;
            this.editGoalCell = false;

        } else {
            switch (cell.type) {
                case CellType.Blocked:                
                    cell.type = CellType.Free;

                    cell.removeDisplayType(CellDisplayType.Wall);
                    cell.removeDisplayType(CellDisplayType.UnknownWall);
                    this.synchronizeRobotMap(cell);

                    break;
                case CellType.Current:
                case CellType.Visited:
                case CellType.Free:   
                        
                    cell.type = CellType.Blocked;                    
                    cell.addDisplayType(CellDisplayType.UnknownWall)
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

        //Kontrolle des eingegeben Sichtradius -> 1 = Sichtradius aus
        //Minimum Sichtradius = 2, weil diagonale bewegung sonst "blind" stattfinden würde (ohne Synchronisation der Maps) und Roboter so durch Wände gehen könnte
        if(this.robotViewRadiusSetting == 1) {
            this.robotViewRadius = Assembler.robotViewRadiusOff;
        } else if(this.robotViewRadiusSetting < 1){
            this.robotViewRadiusSetting = 1;
            this.robotViewRadius = this.robotViewRadiusSetting;
        } else {
            this.robotViewRadius = this.robotViewRadiusSetting; 
        }

        //Zeichnen des Sichtradius
        this.map.robotRadius = this.robotViewRadius;
        this.map.drawViewRadius(this.start);

        if(!this.robotIsMoving) {
            //Setzt alle Blöcke auf Map auf Unbekannt
            this.map.resetKnownWalls();
            //Setzt Roboter Map zurück
            this.robotMap.resetBlocks();
            //Synchronisiert die Maps neu
            this.updateMapsInRadius();
        }
    }
}


