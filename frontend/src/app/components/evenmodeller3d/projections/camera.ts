import * as THREE from 'three';

export interface directionToProjection {
    ['up']: {x: number, y: number, z: number},
    ['down']: {x: number, y: number, z: number},
    ['left']: {x: number, y: number, z: number},
    ['right']: {x: number, y: number, z: number}
}

export function isSameDirectionToProjection(a: directionToProjection, b: directionToProjection): boolean {
    return a['up'].x === b['up'].x && a['up'].y === b['up'].y && a['up'].z === b['up'].z &&
        a['down'].x === b['down'].x && a['down'].y === b['down'].y && a['down'].z === b['down'].z &&
        a['left'].x === b['left'].x && a['left'].y === b['left'].y && a['left'].z === b['left'].z &&
        a['right'].x === b['right'].x && a['right'].y === b['right'].y && a['right'].z === b['right'].z
}

export function fixProjectionMapping(directionToProjection: directionToProjection, cameraPosition: THREE.Vector3, lookDirection: THREE.Vector3): directionToProjection {
    const debugging = false; 

    const angleFromX = angleOfVector(projectVector(cameraPosition).normalize(), new THREE.Vector3(0, 0, 1));

    const cameraPositionCopy = cameraPosition.clone();
    // looking to -Z
    if (angleFromX < 50) {
        if (debugging) console.log('looking to -Z');
        return {
            ['up']: { x: 0, y: 0, z: -1 },
            ['down']: { x: 0, y: 0, z: 1 },
            ['left']: { x: -1, y: 0, z: 0 },
            ['right']: { x: 1, y: 0, z: 0 }
        }
    // looking to +Z
    } else if (angleFromX > 125) {
        if (debugging) console.log('looking to +Z');
        return {
            ['up']: { x: 0, y: 0, z: 1 },
            ['down']: { x: 0, y: 0, z: -1 },
            ['left']: { x: -1, y: 0, z: 0 },
            ['right']: { x: 1, y: 0, z: 0 }
        }
    }
    // looking to -X
    else if (angleFromX > 50 && angleFromX < 125 && cameraPositionCopy.normalize().x > 0) {
        if (debugging) console.log('looking to -X');
        return {
            ['up']: { x: -1, y: 0, z: 0 },
            ['down']: { x: 1, y: 0, z: 0 },
            ['left']: { x: 0, y: 0, z: 1 },
            ['right']: { x: 0, y: 0, z: -1 }
        }
    }
    // looking to +X
    else if (angleFromX > 50 && angleFromX < 125 && cameraPositionCopy.normalize().x < 0) {
        if (debugging) console.log('looking to +X');
        return {
            ['up']: { x: 1, y: 0, z: 0 },
            ['down']: { x: -1, y: 0, z: 0 },
            ['left']: { x: 0, y: 0, z: 1 },
            ['right']: { x: 0, y: 0, z: -1 }
        }
    }



    else {
        return directionToProjection;
    }
    
}

function projectVector(cameraPosition: THREE.Vector3) {
    const normalVector = new THREE.Vector3(0, 1, 0);
    const cameraPositionCopy = cameraPosition.clone();
    const projectedOnPlane = cameraPositionCopy.projectOnPlane(normalVector);

    return projectedOnPlane;
}

function angleOfVector(a: THREE.Vector3, b: THREE.Vector3) {
    const angle = a.angleTo(b) * 180 / Math.PI;
    return angle;
}