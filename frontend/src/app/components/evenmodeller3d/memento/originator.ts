import { Asset } from "../../../interfaces";
import { Memento, MementoThreeObject } from "./memento";

export class Originator {
    private state: Asset | null = null;

    public setState(state: Asset) {
        this.state = state;    
    }

    public storeInMemento() : Memento {
        if (this.state === null) {
            throw new Error('No state to store in memento!')
        }
        return new MementoThreeObject(this.state!);
    }

    public restoreFromMemento(memento: Memento) {
        this.state = memento.getAsset();
    }
}