import * as THREE from 'three';
import { roundSmallToZero } from './mathutils';

export function inferOpositeAxis(vector: THREE.Vector3): THREE.Vector3 {
    let result = vector.clone();
    return result.multiplyScalar(-1);
}

// add to another class for better modularity
// class to calculate the position of an object's bounding box. Then return an array of positions from the furthest point (most negative) to the furthest point (most positive), in clockwise direction.
export class ThreeCalculationUtils {
    public static getAbsolutePosition(object: THREE.Object3D) : [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3] {
        const box3 = new THREE.Box3().setFromObject(object);
        const center = new THREE.Vector3();
        box3.getCenter(center);
        return [
            // math rounding the values for the y because for some reason the library is not returning 0 but instead a small number close to 9.
            // watch this behavior as it might cause some issues.
            // Update 11/14/2024: The problem rises from the rotation, when we compute with either quaternion
            // or simple trigonometry the rotation value will always be a long fraction with cannot make the full rotation properly since the fraction are finite.
            new THREE.Vector3(box3.min.x, roundSmallToZero(box3.min.y), box3.min.z),
            new THREE.Vector3(box3.max.x, roundSmallToZero(box3.min.y), box3.min.z),
            new THREE.Vector3(box3.max.x, roundSmallToZero(box3.min.y), box3.max.z),
            new THREE.Vector3(box3.min.x, roundSmallToZero(box3.min.y), box3.max.z)
        ]
    }
}