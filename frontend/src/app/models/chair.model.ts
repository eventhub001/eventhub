import { HttpClient } from "@angular/common/http";
import { AxisOrientation, ModelThreeDObject, Size } from "../test/3dobjects";
import { Position, Side } from "../test/3dtypes";
import { ThreeDObject } from "./threeobject.model";
import * as THREE from 'three';
import {ModelHandler} from "../services/modelsHandler";
import { AssetModel } from "../interfaces";

export class Chair extends ThreeDObject {

    constructor(id: number, url: string, size: Size, content: THREE.Object3D, position: Position, initialorientation?: AxisOrientation) {
        
        super(id, position, size, content, initialorientation, url);

        if (initialorientation) {
            this.fixOrientation();
        }
    }

    public static async createFromModel(token: string, chairid: number, size: Size, position: Position, http: HttpClient, sides: AxisOrientation = { front: new THREE.Vector3(0, 0, 1), right: new THREE.Vector3(1, 0, 0), top: new THREE.Vector3(0, 1, 0) }) : Promise<Chair> {
        // Load the model from the server, and assigns it accordingly.

        const model: AssetModel = await ModelHandler.getModelMetadata(token, chairid, http);
        const chair: Blob = await ModelHandler.loadModel(token, model.modelPath, http);
        
        const chairModel: THREE.Object3D = await ModelHandler.parseGLBFile(chair);
        
        chairModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.material.side = THREE.FrontSide;
            }
        });

        const newchair = new Chair(chairid, model.modelPath, size, chairModel, position, sides);
        newchair.resize();

        return newchair;
    }

    public override clone(): Chair {
        return new Chair(this.id, this.url!, this.size, this.content.clone(), {x: this.x, y: this.y, z: this.z});
    }
}