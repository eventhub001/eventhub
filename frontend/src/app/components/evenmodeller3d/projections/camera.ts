import * as THREE from 'three';

export interface directionToProjection {
    ['up']: {x: number, y: number, z: number},
    ['down']: {x: number, y: number, z: number},
    ['left']: {x: number, y: number, z: number},
    ['right']: {x: number, y: number, z: number}
}

export function fixProjectionMapping(directionToProjection: directionToProjection, lookDirection: THREE.Vector3): directionToProjection {
    const threshold = 0.3;
    // looking to -Z
    if (lookDirection.z < -(1 - threshold) || lookDirection.z > -(0 + 0.0001)) {
        console.log("looking to -Z");
        return {
            ['up']: {x: 0, y: 0, z: 1},
            ['down']: {x: 0, y: 0, z: -1},
            ['left']: {x: 1, y: 0, z: 0},
            ['right']: {x: -1, y: 0, z: 0}
        }
    // looking to +Z
    } else if (lookDirection.z > (1 - threshold)) {
        console.log("looking to +Z");
        return {
            ['up']: {x: 0, y: 0, z: -1},
            ['down']: {x: 0, y: 0, z: 1},
            ['left']: {x: -1, y: 0, z: 0},
            ['right']: {x: 1, y: 0, z: 0}
        }
    }
    // looking to -X
    else if (lookDirection.x < -(1 - threshold)) {
        console.log("looking to -X");
        return {
            ['up']: {x: 0, y: 1, z: 0},
            ['down']: {x: 0, y: -1, z: 0},
            ['left']: {x: -1, y: 0, z: 0},
            ['right']: {x: 1, y: 0, z: 0}
        }
    }
    // looking to +X
    else if (lookDirection.x > (1 - threshold)) {
        console.log("looking to +X");
        return {
            ['up']: {x: 0, y: -1, z: 0},
            ['down']: {x: 0, y: 1, z: 0},
            ['left']: {x: 1, y: 0, z: 0},
            ['right']: {x: -1, y: 0, z: 0}
        }
    }



    else {
        return directionToProjection;
    }
    
}