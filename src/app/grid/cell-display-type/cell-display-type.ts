
/*###################################
      Deklaration der Zelltypen
###################################*/

export class CellDisplayType {
    private _color: string;
    private _index: number;

    constructor(index: number,color: string){
        this.color = color;
        this.index = index;
    }

    set color(color: string){
        this._color = color
    }

    get color(){
       return this._color
    }

    set index(index: number){
        if(index > 1000) throw Error("Index must be smaller than 1000");
        if(index < 0) throw Error("Index must be equal or greater than 0");
        this._index = index
    }

    get index(){
       return this._index
    }

    public static Goal = new CellDisplayType(1000,"#F88")
    public static Start = new CellDisplayType(1000,"#8F8")
    public static Wall = new CellDisplayType(900,"#666")
    public static Path = new CellDisplayType(400,"#44F")
    public static MoveingObstacle = new CellDisplayType(800,"#BBF")
    public static Free = new CellDisplayType(0,"#FFF")
    public static Gradient(color:string) {return new CellDisplayType(300,color)}
  }
  
  export default CellDisplayType;