export interface arrowToAxis {
    ['up']: {x: number, y: number, z: number},
    ['down']: {x: number, y: number, z: number},
    ['left']: {x: number, y: number, z: number},
    ['right']: {x: number, y: number, z: number}
}


export function isSameArrowsToAxis(a: arrowToAxis, b: arrowToAxis): boolean {
    return a['up'].x === b['up'].x && a['up'].y === b['up'].y && a['up'].z === b['up'].z &&
        a['down'].x === b['down'].x && a['down'].y === b['down'].y && a['down'].z === b['down'].z &&
        a['left'].x === b['left'].x && a['left'].y === b['left'].y && a['left'].z === b['left'].z &&
        a['right'].x === b['right'].x && a['right'].y === b['right'].y && a['right'].z === b['right'].z
}