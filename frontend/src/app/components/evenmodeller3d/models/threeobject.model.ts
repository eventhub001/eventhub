import * as THREE from 'three';
import { Position } from '../modelobjects/3dtypes';
import { AxisOrientation, Size } from '../modelobjects/3dobjects';
import { inferOpositeAxis } from '../modelobjects/vectorutils';
import { constant } from 'lodash';
import { Asset, Orientation } from '../../../interfaces';

export class ThreeDObject implements Asset {
    id: number; 
    url: string | undefined;
    x: number;
    y: number;
    z: number;
    content: THREE.Object3D;
    initialOrientation: Orientation;
    orientation: Orientation;
    size: Size;

    constructor(
        id: number,
        position: Position,
        size: Size,
        content: THREE.Object3D,
        orientation: AxisOrientation = {
            front: new THREE.Vector3(0, 0, 1),
            right: new THREE.Vector3(1, 0, 0),
            top: new THREE.Vector3(0, 1, 0) },
        url?: string) {
        
        this.orientation = {
            front: new THREE.Vector3(0, 0, 1),
            back: new THREE.Vector3(0, 0, -1),
            left: new THREE.Vector3(-1, 0, 0),
            right: new THREE.Vector3(1, 0, 0),
            top: new THREE.Vector3(0, 1, 0),
            bottom: new THREE.Vector3(0, -1, 0)
        };
        
        const back = inferOpositeAxis(orientation.front);
        const left = inferOpositeAxis(orientation.right);
        const bottom = inferOpositeAxis(orientation.top);
        this.size = size;
        this.initialOrientation = {
            front: orientation.front,
            back: back,
            left: left,
            right: orientation.right,
            top: orientation.top,
            bottom: bottom
        };
        this.id = id;
        this.url = url;
        this.x = position.x;
        this.y = position.y;
        this.z = position.z;

        this.content = content;
    }

    public fixOrientation() {

        if (this.content === undefined) {
            throw new Error('Content is not defined. Cannot fix orientation.');
        }

        if (!this.initialOrientation.top) {
            throw new Error('Top vector is not defined.');
        }

        const currentUp = new THREE.Vector3(0, 1, 0); // Default up vector in THREE.js
        const up = this.initialOrientation.top.clone().normalize();
        this.rotateWithQuaternion(new THREE.Quaternion(), currentUp, up);

        // now the front.
        const currentFront = new THREE.Vector3(0, 0, 1);
        const front = this.initialOrientation.front.clone().normalize();
        this.rotateWithQuaternion(new THREE.Quaternion(), currentFront, front);
        
    }

    rotate(x_axis: number) {
        // 1. change the sides values.

        const front = this.initialOrientation.front.clone();

        if (x_axis === 1) {
            this.initialOrientation.front.cross(new THREE.Vector3(0, 1, 0));
        }

        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(front, this.initialOrientation.front);
        this.content.applyQuaternion(quaternion);
    }

    public resize() {
        // Get the current bounding box of the object to determine its current size
        const boundingBox = new THREE.Box3().setFromObject(this.content);
        const currentSize = new THREE.Vector3();
        boundingBox.getSize(currentSize); // Get the current width, height, and depth of the object

        //Calculate the scale factors to resize the object
        const scaleFactors = new THREE.Vector3(
            this.size.width / currentSize.x,
            this.size.height / currentSize.y,
            this.size.depth / currentSize.z
        );

        // Apply the calculated scale factors to resize the object

        this.content.scale.set(scaleFactors.x, scaleFactors.y, scaleFactors.z);
    }

    public move(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public clone(): Asset {
        const newContent = this.content.clone();
        
        newContent.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = child.material.clone();
            }
        });

        return new ThreeDObject(this.id, { x: this.x, y: this.y, z: this.z }, this.size, newContent, this.initialOrientation, this.url);
    }

    private rotateWithQuaternion(Quaternion: THREE.Quaternion, from: THREE.Vector3, to: THREE.Vector3) {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(from, to);
        this.content.applyQuaternion(Quaternion);
    }
}