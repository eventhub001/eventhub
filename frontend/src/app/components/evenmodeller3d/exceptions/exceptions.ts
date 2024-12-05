export class GridAdditionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GridAdditionError";
    }
}