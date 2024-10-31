import { ThreeDObject } from "./threeobject.model";
import { Position } from "../test/3dtypes";
import * as THREE from 'three';
import { AxisOrientation, Size } from "../test/3dobjects";
import { HttpClient } from "@angular/common/http";
import { AssetTexture } from "../interfaces";
import { TextureHandler } from "../services/modelsHandler";

export class Floor extends ThreeDObject {
    
    width: number;
    depth: number;

    constructor(width: number,
        depth: number,
        position: Position,
        url?: string,
        sides: AxisOrientation = { front: new THREE.Vector3(1, 0, 0), right: new THREE.Vector3(1, 0, 0), top: new THREE.Vector3(0, 1, 0) },
        content?: THREE.Object3D) {
        
        let model: THREE.Mesh;
        if (content !== undefined) {
            model = content as THREE.Mesh;
        }
        else {  
            model = content || new THREE.Mesh(
                new THREE.PlaneGeometry(width, depth),
                new THREE.MeshPhongMaterial({ color: 0x00ff00 })
            );
        }

        //model.rotateOnAxis(sides.top, Math.PI / 2);
        model.rotateOnAxis(sides.right, -(Math.PI / 2));

        super(0, position, {width: width, height: 0, depth: depth}, model, sides, url);
        
        this.width = width;
        this.depth = depth;

        //this.fixOrientation();
    }

    public override clone(): Floor {
        return new Floor(this.width, this.depth, {x: this.x, y: this.y, z: this.z}, this.url, this.initialOrientation, this.content.clone());
    }

    public static async createFromModel(
        width: number,
        height: number,
        token: string,
        floorid: number,
        position: Position,
        http: HttpClient,
        sides: AxisOrientation = { front: new THREE.Vector3(0, 0, 1), right: new THREE.Vector3(1, 0, 0), top: new THREE.Vector3(0, 1, 0) }) : Promise<Floor> {
        const model: AssetTexture = await TextureHandler.getTextureMetadata(token, floorid, http);
        const chair: Blob = await TextureHandler.loadTextureBlob(token, model.texture_path, http);
        
        const chairTexture = await TextureHandler.parseTextureBlob(chair);

        const modelMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshPhongMaterial({ map: chairTexture })
        );

        modelMesh.receiveShadow = true;

        const newchair = new Floor(width, height, position, model.texture_path, sides, modelMesh);
        //newchair.resize();

        return newchair;
    }
}