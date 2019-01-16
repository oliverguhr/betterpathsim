import { Component, OnInit, Input } from '@angular/core';

import { Map, Moveable, CellType, Position, Cell } from "./grid/index";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit{

    title = 'Better Pathsim';
    zahl = 0;

    @Input('parameter')
    userName: String;

    ngOnInit() { 
        console.log(this.userName);
    }

}
