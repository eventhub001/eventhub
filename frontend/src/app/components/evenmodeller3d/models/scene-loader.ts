import { AssetMetadata, AssetModel, IScene3D, IScene3DSetting, ISceneSnapshot3D } from "../../../interfaces";
import { ModelHandler } from "../../../services/models-parse.service";
import { DefaultThreeDObject } from "./default.model";
import { Event3DManager } from "../modeller-objects/event3dmanager";
import * as THREE from "three";

export class SceneLoader {

    public async mapContentsToModel(assetModels: AssetModel[]): Promise<Record<number, THREE.Object3D>> {
        const modelMap = await Promise.all(
          assetModels.map(async (assetModel) => {
            const object3D = await ModelHandler.parseGLBFile(assetModel.blob);
            return { [assetModel.id]: object3D };
          })
        );
    
        return modelMap.reduce((acc, item) => {
          return { ...acc, ...item };
        }, {} as Record<number, THREE.Object3D>);
    }

    private async createThreeDObject(modelData: any, models: { id: number; blob: Blob }[]): Promise<DefaultThreeDObject | null> {
        const modelBlob = models.find(model => model.id === modelData.id)?.blob;
        if (!modelBlob) {
          console.warn(`Model with ID ${modelData.id} not found.`);
          return null;
        }
      
        const model = await ModelHandler.parseGLBFile(modelBlob);
        return new DefaultThreeDObject(
          modelData.id,
          modelData.modelPath,
          { width: modelData.width, height: modelData.height, depth: modelData.depth },
          model,
          { x: modelData.x, y: modelData.y, z: modelData.z },
          {
            front: new THREE.Vector3(modelData.frontx, modelData.fronty, modelData.frontz),
            right: new THREE.Vector3(modelData.rightx, modelData.righty, modelData.rightz),
            top: new THREE.Vector3(modelData.topx, modelData.topy, modelData.topz),
          }
        );
    }

    public async createThreeDObjects(
        modelMetadata: AssetMetadata[],
        models: AssetModel[]
      ): Promise<DefaultThreeDObject[]> {
        const objects = await Promise.all(
          modelMetadata.map(async (modelData) => {
            const modelBlob = models.find(model => model.id === modelData.id)?.blob;
            if (!modelBlob) {
              console.warn(`Model with ID ${modelData.id} not found.`);
              return null;
            }
      
            const model = await ModelHandler.parseGLBFile(modelBlob);
            return new DefaultThreeDObject(
              modelData.id,
              modelData.modelPath,
              { width: modelData.width, height: modelData.height, depth: modelData.depth },
              model,
              { x: modelData.x, y: modelData.y, z: modelData.z },
              {
                front: new THREE.Vector3(modelData.frontx, modelData.fronty, modelData.frontz),
                right: new THREE.Vector3(modelData.rightx, modelData.righty, modelData.rightz),
                top: new THREE.Vector3(modelData.topx, modelData.topy, modelData.topz),
              }
            );
          })
        );
      
        return objects.filter(obj => obj !== null) as DefaultThreeDObject[]; 
      }
}