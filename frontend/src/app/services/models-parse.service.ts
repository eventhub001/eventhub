import { firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import * as THREE from 'three';
import { ModelThreeDObject } from "../components/evenmodeller3d/utils/3dobjects-utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AssetMetadata, AssetTexture } from "../interfaces";

export class ModelHandler {
    public static async getModelMetadata(token: string, id: number, http: HttpClient) : Promise<AssetMetadata> {
        // TODO: Load model from server
        const url = `http://localhost:8080/models/${id}`;
        // bearer token
        const bearer = token;

        const headers = { Authorization: `Bearer ${bearer}` };

        const blob = await firstValueFrom(http.get<AssetMetadata>(url, { headers, responseType: 'json' }));

        return blob;
    }

    public static async loadModel(token: string, url: string, http: HttpClient) : Promise<Blob> {
        // Load the model

        const get_url = `http://localhost:8080/models/files/model/${url}`;

        const bearer = token;

        const headers = { Authorization: `Bearer ${bearer}` };

        const blob = await firstValueFrom(http.get(get_url, { headers, responseType: 'blob' }));

        return blob;
    }

    public static async parseGLBFile(blob: Blob): Promise<THREE.Object3D> {
        const loader = new GLTFLoader();
    
        return new Promise<THREE.Object3D>((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
    
                loader.parse(arrayBuffer, '', (gltf) => {
                    const gltfScene = gltf.scene;
                    const chair: ModelThreeDObject = ModelThreeDObject.fromGLTF(gltfScene, false);
                    const parentDS = chair.pivot;

                    
                    resolve(parentDS); // Resolve with the THREE.Object3D
                },
                (error) => {
                    console.error(error);
                    reject(error); // Reject if there is an error during parsing
                });
            };
    
            reader.onerror = (error) => {
                console.error(error);
                reject(error); // Reject if there is an error in reading the file
            };

            reader.readAsArrayBuffer(blob);
        });
    }
}

export class TextureHandler {
    public static async getTextureMetadata(token: string, id: number, http: HttpClient): Promise<AssetTexture> {
        // TODO: Load texture metadata from the server
        const url = `http://localhost:8080/textures/${id}`;
        const bearer = token;

        const headers = { Authorization: `Bearer ${bearer}` };

        const metadata = await firstValueFrom(http.get<AssetTexture>(url, { headers, responseType: 'json' }));

        return metadata;
    }

    public static async loadTextureBlob(token: string, url: string, http: HttpClient): Promise<Blob> {
        // Load the texture as a Blob
        const get_url = `http://localhost:8080/textures/files/${url}`;
        const bearer = token;

        const headers = { Authorization: `Bearer ${bearer}` };

        const textureBlob = await firstValueFrom(http.get(get_url, { headers, responseType: 'blob' }));

        return textureBlob;
    }

    public static async parseTextureBlob(blob: Blob): Promise<THREE.Texture> {
        const loader = new THREE.TextureLoader();

        return new Promise<THREE.Texture>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const imageUrl = reader.result as string;
                // Load texture from the Blob URL
                loader.load(
                    imageUrl,
                    (texture) => {
                        resolve(texture); // Resolve with the loaded texture
                    },
                    undefined,
                    (error) => {
                        console.error(error);
                        reject(error); // Reject if there is an error during loading
                    }
                );
            };

            reader.onerror = (error) => {
                console.error(error);
                reject(error); // Reject if there is an error in reading the file
            };

            reader.readAsDataURL(blob); // Read the blob as a data URL for texture loading
        });
    }
}