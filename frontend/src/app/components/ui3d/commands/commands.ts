import { Direction } from "../../evenmodeller3d/modelobjects/event3dmanager"

export type addtion = {
    x?: number,
    z?: number,
    id?: number
}
export type move = {
    x: number,
    y: number,
    z: number
}

export type rotate = {
    direction: Direction.LEFT | Direction.RIGHT,
    angle: (90 | 180 | 270 | -90 | -180 | -270)
}