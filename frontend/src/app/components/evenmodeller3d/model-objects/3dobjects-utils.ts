import * as THREE from 'three';
import { Position, Side } from './3dtypes';
import { Asset } from '../../../interfaces';

export type AxisOrientation = {
    top: THREE.Vector3,
    right: THREE.Vector3,
    front: THREE.Vector3
}

export type Size  = {
    width: number,
    height: number,
    depth: number
}

export class DebuggingUtils {
    public static centerPoint() : THREE.Mesh {
        const center = new THREE.Vector3(0, 0, 0);

        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );

        dot.position.copy(center);

        return dot;
    }

    public static showPoint(point: THREE.Vector3, scene: THREE.Scene, color: string) : void {
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            new THREE.MeshBasicMaterial({ color: color })
        );

        dot.position.copy(point);

        scene.add(dot);
    }

    public static showBoundingBox(model: THREE.Object3D, scene: THREE.Scene) : void {
        const box = new THREE.Box3().setFromObject(model);
        const boxHelper = new THREE.Box3Helper(box, 0xffff00);

        const center = box.getCenter(new THREE.Vector3());
        const centerSphere = new THREE.SphereGeometry(0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0x000ff });
        const centerBB = new THREE.Mesh(centerSphere, material);
        centerBB.position.copy(center);

        scene.add(centerBB);
        scene.add(boxHelper);
    }

    public static showSide(model: Asset, side: Side, scene: THREE.Scene) {
        if (side === Side.TOP) {
            const arrowHelper = new THREE.ArrowHelper(model.initialOrientation.top, new THREE.Vector3(model.x, model.y, model.z), 1, 0xff0000);
            scene.add(arrowHelper);
        }
        else if (side === Side.BOTTOM) {
            const arrowHelper = new THREE.ArrowHelper(model.initialOrientation.bottom, new THREE.Vector3(model.x, model.y, model.z), 1, 0xff0000);
            scene.add(arrowHelper);
        }
        else if (side === Side.LEFT) {
            const arrowHelper = new THREE.ArrowHelper(model.initialOrientation.left, new THREE.Vector3(model.x, model.y, model.z), 1, 0xff0000);
            scene.add(arrowHelper);
        }
        else if (side === Side.RIGHT) {
            const arrowHelper = new THREE.ArrowHelper(model.initialOrientation.right, new THREE.Vector3(model.x, model.y, model.z), 1, 0xff0000);
            scene.add(arrowHelper);
        }
        else if (side === Side.FRONT) {
            const arrowHelper = new THREE.ArrowHelper(model.initialOrientation.front, new THREE.Vector3(model.x, model.y, model.z), 1, 0xff0000);
            scene.add(arrowHelper);
        }
        else if (side === Side.BACK) {
            const arrowHelper = new THREE.ArrowHelper(model.initialOrientation.back, new THREE.Vector3(model.x, model.y, model.z), 1, 0xff0000);
            scene.add(arrowHelper);
        }
    }

    public static drawDot(point: THREE.Vector3, scene: THREE.Scene, color: string) {
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.1),
            new THREE.MeshBasicMaterial({ color: color })
        );

        dot.position.copy(point);

        scene.add(dot);
    }

    public static showLights(scene: THREE.Object3D) {
        scene.traverse((obj) => {
            if (obj.type === "SpotLight" || obj.type === "DirectionalLight" || obj.type === "PointLight" || obj.type === "HemisphereLight" || obj.type === "AmbientLight" || obj.type === "SpotLight") {
              //scene.remove(obj)
              console.log(obj);
            }
        });
    }
}

export function checkCollisionCustom(from: THREE.Object3D, to: THREE.Object3D): boolean {

    console.log(from.uuid + ", " + to.uuid);
    // Get the bounding box corners based on scale and position
    console.log(from.position, to.position);
    return true;
}

export class ModelThreeDObject {

    boundingBox!: THREE.Box3;
    center!: THREE.Vector3;
    pivot!: THREE.Object3D;

    model!: THREE.Object3D;

    constructor(model: THREE.Object3D, fixCenter: Boolean = true) {
        this.model = model;

        if (fixCenter) {            
            this.boundingBox = new THREE.Box3().setFromObject(this.model);
            this.center = this.boundingBox.getCenter(new THREE.Vector3());

            this.fixCenter();
        }
    }

    public static fromGLTF(gltf: THREE.Object3D, removeLights: Boolean = true) : ModelThreeDObject {
        const threeobject = new ModelThreeDObject(gltf, true);
        threeobject.model.traverse((child) => {
            
            if (removeLights) {
                if (child instanceof THREE.SpotLight) {
                    threeobject.model.remove(child);
                }
            }
        });
        
        return threeobject;
    }

    private fixCenter(): THREE.Object3D {
        this.pivot = new THREE.Object3D();
        this.pivot.position.set(this.center.x, this.center.y, this.center.z);
        this.model.position.set(-this.center.x, -this.center.y, -this.center.z);

        this.pivot.add(this.model);
        return this.pivot;
    }
}

export function getLastParentBefore(id: string, object: THREE.Object3D): THREE.Object3D | null {
    if (object.parent && object.parent.uuid === id) {
        return object; // Return the current object when its parent matches the id
    }
    return object.parent ? getLastParentBefore(id, object.parent) : null; // Recursively traverse the hierarchy
}


