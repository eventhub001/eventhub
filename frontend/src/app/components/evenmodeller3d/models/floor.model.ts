import { ThreeDObject } from "./threeobject.model";
import { Position } from "../modeller-objects/3dtypes";
import * as THREE from 'three';
import { AxisOrientation, Size } from "../utils/3dobjects-utils";

export class Floor extends ThreeDObject {
    
    width: number;
    depth: number;

    constructor(width: number,
        depth: number,
        position: Position,
        url?: string,
        sides: AxisOrientation = { front: new THREE.Vector3(0, 0, 1), right: new THREE.Vector3(1, 0, 0), top: new THREE.Vector3(0, 1, 0) },
        content?: THREE.Object3D,
        texture?: THREE.Texture) {
        
        let model: THREE.Mesh;
        if (content !== undefined) {
            model = content as THREE.Mesh;
        }
        else {
            if (texture) {
                model = new THREE.Mesh(
                    new THREE.PlaneGeometry(width, depth),
                    new THREE.MeshPhongMaterial({ map: texture })
                );

                model.receiveShadow = true;
            }

            else {
                model = content || new THREE.Mesh(
                    new THREE.PlaneGeometry(width, depth),
                    new THREE.MeshPhongMaterial({ color: 0x00ff00 })
                );

                model.receiveShadow = true;
            }
        }

        super(0, {width: width, height: 0.1, depth: depth}, model, position, sides, sides, url, texture);
        
        model.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        
        this.width = width;
        this.depth = depth;

        if (texture) {
            this.loadTexture();
        }
    }

    private loadTexture() {
        if (this.texture) {
            this.content.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.map = this.texture;
                }
            })
        }
    }
}