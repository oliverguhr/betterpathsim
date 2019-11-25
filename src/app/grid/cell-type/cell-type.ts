
/*###################################
      Deklaration der Zelltypen
###################################*/

export enum CellType {
  Free = 0,             //Freie Zellen
  Blocked = 1,          //Blockierte Zellen
  Visited = 2,          //alle Zellen, die vom Algorithmus untersucht worden
  Current = 3,          //Path Zellen
  Start = 4,            //Start Zelle
  Goal = 5              //Ziel Zelle
}
export default CellType;
