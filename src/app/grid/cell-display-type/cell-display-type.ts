
/*###################################
      Deklaration der Zelltypen
###################################*/

export class CellDisplayType {
    private _color: Number;
    private _index: Number;

    constructor(index: Number,color: Number){
        this.color = color;
        this.index = index;
    }

    set color(color: Number){
        this._color = color
    }

    get color(){
       return this._color
    }

    set index(index: Number){
        if(index > 1000) throw Error("Index must be smaller than 1000");
        if(index < 0) throw Error("Index must be equal or greater than 0");
        this._index = index
    }

    get index(){
       return this._index
    }

    static Goal(){return new CellDisplayType(1000,)}
  }
  
  