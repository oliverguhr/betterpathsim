import * as _ from "lodash";
import { CellDisplayType } from '../grid';

/**
 * Hacky implementation of a PriorityQueue.
 * I added this to meet the needs of the LPA* algorithm.
 */
export class CellPriorityQueue<Telement> {
    private items: CellDisplayType[];
    constructor(private comparator: (a: number, b: number) => number) {
        this.items = new Array();
    }

    public insert(item: CellDisplayType) {
        this.items.push(item);
        this.sort();
    }
    public remove(item: CellDisplayType) {
        _.remove(this.items, item);
    }

    public has(item: CellDisplayType) {
        return _.findIndex(this.items, x => x === item) !== -1;
    }

    public removeByIndex(index: number) {
        this.items = this.items.filter(x => x.index !== index)
    }

    public clear(){
      this.items = new Array();
    }

    public topIndex() {
        if (this.items[0] !== undefined) {
            return (this.items[0] as CellDisplayType).index;
        } else {
            return CellDisplayType.Free.index;
        }
    }

    public topDisplayType() {
        if (this.items[0] !== undefined) {
            return (this.items[0] as CellDisplayType);
        } else {
            return CellDisplayType.Free;
        }
    }

    public pop() {
        return this.items.shift();
    }

    public get isEmpty(){
      return this.items.length <= 0;
    }

    private sort() {
        this.items = this.items.sort((a, b) => this.comparator((a as CellDisplayType).index, (b as CellDisplayType).index));
    }
}
