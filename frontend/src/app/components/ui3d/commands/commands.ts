import { Direction } from "../../evenmodeller3d/model-objects/event3dmanager"
import { SELECTIONTYPE } from "../menus/arrows"

export type addtion = {
    x?: number,
    z?: number,
    id?: number
}
export type directional = {
    direction: SELECTIONTYPE,
    x: number,
    y: number,
    z: number
}