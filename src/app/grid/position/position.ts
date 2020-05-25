import { Component } from '@angular/core';

@Component({
  selector: 'app-position'
})
export class Position {

  x: number;
  y: number;

  constructor(x: number,y: number) { 
      this.x = x;
      this.y = y;
  }

  public toString() {
    return "[x: "+this.x+" y: "+this.y+"]";
  }
}
