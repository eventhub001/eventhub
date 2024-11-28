import * as THREE from 'three';
import { Position } from '../model-objects/3dtypes';
import { AxisOrientation, Size } from '../model-objects/3dobjects-utils';
import { inferOpositeAxis } from '../model-objects/vectorutils';
import { constant } from 'lodash';
import { Asset, Orientation } from '../../../interfaces';

export class ThreeDObject implements Asset {
    id: number; 
    url: string | undefined;
    x: number;
    y: number;
    z: number;
    texture: THREE.Texture | undefined;
    content: THREE.Object3D;
    initialOrientation: Orientation;
    orientation: Orientation;
    size: Size;

    constructor(
        id: number,
        size: Size,
        content: THREE.Object3D,
        position: Position,
        orientation: AxisOrientation = {
            front: new THREE.Vector3(0, 0, 1),
            right: new THREE.Vector3(1, 0, 0),
            top: new THREE.Vector3(0, 1, 0) },
        url?: string, texture: THREE.Texture | undefined = undefined) {
        
        this.orientation = {
            front: new THREE.Vector3(1, 0, 0),
            back: new THREE.Vector3(0, 0, -1),
            left: new THREE.Vector3(-1, 0, 0),
            right: new THREE.Vector3(1, 0, 0),
            top: new THREE.Vector3(0, 1, 0),
            bottom: new THREE.Vector3(0, -1, 0)
        };

        if (texture !== undefined) {
            this.texture = texture;
        }
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

        const currentUp = new THREE.Vector3(0, 1, 0);
        const up = this.initialOrientation.top.clone().normalize();
        this.rotateWithQuaternion(new THREE.Quaternion(), currentUp, up);

        const currentFront = new THREE.Vector3(0, 0, 1);
        const front = this.initialOrientation.front.clone().normalize();
        this.rotateWithQuaternion(new THREE.Quaternion(), currentFront, front);
    }

    rotate(x: number, y: number, z: number) {
        const quat = new THREE.Quaternion();
        const from = new THREE.Vector3(this.orientation.front.x, this.orientation.front.y, this.orientation.front.z);
        const to = new THREE.Vector3(x, y, z).normalize();
        console.log("orientation", this.orientation.front);
        console.log(from, to);
        this.rotateWithQuaternion(quat, from, to);
        this.orientation = {
            front: to,
            back: inferOpositeAxis(to),
            left: inferOpositeAxis(to.clone().cross(new THREE.Vector3(0, 1, 0))),
            right: to.clone().cross(new THREE.Vector3(0, 1, 0)),
            top: new THREE.Vector3(0, 1, 0),
            bottom: new THREE.Vector3(0, -1, 0)
        }
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
        newContent.position.set(this.content.position.x, this.content.position.y, this.content.position.z);
        
        newContent.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = child.material.clone();
            }
        });

        return new ThreeDObject(this.id, this.size, newContent, { x: this.x, y: this.y, z: this.z }, this.initialOrientation, this.url);
    }

    private rotateWithQuaternion(Quaternion: THREE.Quaternion, from: THREE.Vector3, to: THREE.Vector3) {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(from, to);
        this.content.applyQuaternion(quaternion);
    }

    private resetOrientation() {
        // now the front.
        const currentFront = new THREE.Vector3(0, 0, 1);
        const front = this.orientation.front.clone();
        
        this.rotateWithQuaternion(new THREE.Quaternion(), front, currentFront);
        this.orientation = this.initialOrientation;
    }
}