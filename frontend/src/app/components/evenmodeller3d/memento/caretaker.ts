import { Memento } from "./memento";

export class CareTaker {
    public mementos: Memento[] = [];

    public addMemento(memento: Memento) {
        this.mementos.push(memento);
    }

    public getMemento(index: number): Memento {
        return this.mementos[index];
    }

    public getLatestState() : Memento {
        return this.mementos[this.mementos.length - 1];
    }

    public getPreviousState() : Memento {
        return this.mementos[this.mementos.length - 2];
    }
}