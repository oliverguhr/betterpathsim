import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-assembler',
  templateUrl: './assembler.html',
  styleUrls: ['./assembler.css']
})
export class Assembler implements OnInit {

    @Input() cols :String;
    @Input() rows :String;

    constructor() { }

    ngOnInit() {
        console.log(this.cols, this.rows);
    
        
    
    
    }

}
