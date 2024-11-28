import { HttpClient } from "@angular/common/http";
import { AxisOrientation, ModelThreeDObject, Size } from "../model-objects/3dobjects-utils";
import { Position, Side } from "../model-objects/3dtypes";
import { ThreeDObject } from "./threeobject.model";
import * as THREE from 'three';
import {ModelHandler} from "../../../services/modelsHandler";
import { AssetMetadata } from "../../../interfaces";

export class DefaultThreeDObject extends ThreeDObject {

    constructor(
        id: number,
        url: string,
        size: Size,
        content: THREE.Object3D,
        position: Position,
        initialorientation?: AxisOrientation,
        texture?: THREE.Texture
    ) {
        
        super(id, size, content, position, initialorientation, url, texture);

        if (initialorientation) {
            this.fixOrientation();
            this.resize();
        }

        if (texture) {
            this.loadTexture();
        }
    }

    public static async createFromModel(token: string, chairid: number, size: Size, position: Position, http: HttpClient, sides: AxisOrientation = { front: new THREE.Vector3(0, 0, 1), right: new THREE.Vector3(1, 0, 0), top: new THREE.Vector3(0, 1, 0) }) : Promise<DefaultThreeDObject> {
        // Load the model from the server, and assigns it accordingly.

        const model: AssetMetadata = await ModelHandler.getModelMetadata(token, chairid, http);
        const chair: Blob = await ModelHandler.loadModel(token, model.modelPath, http);
        
        const chairModel: THREE.Object3D = await ModelHandler.parseGLBFile(chair);
        
        chairModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.material.side = THREE.FrontSide;
            }
        });

        const newchair = new DefaultThreeDObject(chairid, model.modelPath, size, chairModel, position, sides);
        newchair.resize();

        return newchair;
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