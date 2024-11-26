import * as THREE from 'three';
import { arrowToAxis } from './movement';
import { arrowsToRotation } from './rotation';


export function fixProjectionMapping(directionToProjection: arrowToAxis, cameraPosition: THREE.Vector3, lookDirection: THREE.Vector3): arrowToAxis {
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
            ['left']: { x: 1, y: 0, z: 0 },
            ['right']: { x: -1, y: 0, z: 0 }
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
            ['left']: { x: 0, y: 0, z: -1 },
            ['right']: { x: 0, y: 0, z: 1 }
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


export function fixRotationMapping(arrowToAxis: arrowToAxis): arrowsToRotation {
    const result: arrowsToRotation= {['up']: 0, ['down']: 0, ['left']: 0, ['right']: 0};

    const upArrow = arrowToAxis['up']; 
    if (upArrow.x === 0 && upArrow.y === 0 && upArrow.z === 1) {
        result['up'] = 90;
        result['down'] = 270;
        result['left'] = 0;
        result['right'] = 180;
    } else if (upArrow.x === 0 && upArrow.y === 0 && upArrow.z === -1) {
        result['up'] = 270;
        result['down'] = 90;
        result['left'] = 180;
        result['right'] = 0;
    }
    else if (upArrow.x === 1 && upArrow.y === 0 && upArrow.z === 0) {
        result['up'] = 0;
        result['down'] = 180;
        result['left'] = 270;
        result['right'] = 90;
    } else if (upArrow.x === -1 && upArrow.y === 0 && upArrow.z === 0) {
        result['up'] = 180;
        result['down'] = 0;
        result['left'] = 90;
        result['right'] = 270;
    }

    return result;
}

export function arrowsToAxisAsAngle(arrowToAxis: arrowToAxis): 0 | 90 | 180 | 270 {
    return 0;
}