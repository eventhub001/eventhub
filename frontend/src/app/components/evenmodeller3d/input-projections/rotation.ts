export interface arrowsToRotation {
    ['up']: 0 | 90 | 180 | 270,
    ['down']: 0 | 90 | 180 | 270,
    ['left']: 0 | 90 | 180 | 270,
    ['right']: 0 | 90 | 180 | 270
}

export function isSameArrowsToRotation(a: arrowsToRotation, b: arrowsToRotation): boolean {
    return a['up'] === b['up'] && a['down'] === b['down'] && a['left'] === b['left'] && a['right'] === b['right']
}