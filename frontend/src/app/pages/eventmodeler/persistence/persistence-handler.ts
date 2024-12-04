import { inject } from "@angular/core";
import { Asset, AssetMetadata, ISceneSnapshot3D, IScene3DSetting, ISetting, IScene3D } from "../../../interfaces";
import { SceneSnapshot3DService } from "../../../services/scenesnapshot3d.service";
import { AuthService } from "../../../services/auth.service";
import { SettingService } from "../../../services/setting.service";
import { SettingOptionService } from "../../../services/setting-option.service";
import { Scene3DService } from "../../../services/scene3d.service";

export class PersistenceHandler {
    
    assets: Asset[] = [];
    scene3D: IScene3D = {} as IScene3D;
    sceneSettings: IScene3DSetting = {} as IScene3DSetting;
    settings: ISetting[] = [];
    scenesnapshot3D: ISceneSnapshot3D[] = [];
    sceneSnapshot3DService: SceneSnapshot3DService;
    authService: AuthService;
    scene3DService : Scene3DService;
    settingService: SettingService;
    settingOptionService: SettingOptionService;

    constructor(scene3D: IScene3D, assets: Asset[], sceneSettings: IScene3DSetting, scene3DService : Scene3DService, sceneSnapshot3DService: SceneSnapshot3DService, settingService: SettingService, settingOptionService: SettingOptionService, userService : AuthService) {
        this.assets = assets;
        this.scene3D = scene3D;
        this.sceneSettings = sceneSettings;
        this.scene3DService = scene3DService;
        this.sceneSnapshot3DService = sceneSnapshot3DService;
        this.settingService = settingService;
        this.settingOptionService = settingOptionService;
        this.authService = userService;
    }

    public init() {
        this.assets.forEach((asset) => {
            const modelMetadata = {
                id: asset.id
            } as AssetMetadata
            const scene3D = {} as ISceneSnapshot3D;
            scene3D.model = modelMetadata;
            scene3D.user = {id: this.authService.getUser()?.id};
            scene3D.x = asset.x;
            scene3D.y = asset.y;
            scene3D.z = asset.z;
            scene3D.topx = asset.orientation.top.x;
            scene3D.topy = asset.orientation.top.y;
            scene3D.topz = asset.orientation.top.z;
            scene3D.frontx = asset.orientation.front.x;
            scene3D.fronty = asset.orientation.front.y;
            scene3D.frontz = asset.orientation.front.z;
            scene3D.backx = asset.orientation.back.x;
            scene3D.backy = asset.orientation.back.y;
            scene3D.backz = asset.orientation.back.z;
            scene3D.leftx = asset.orientation.left.x;
            scene3D.lefty = asset.orientation.left.y;
            scene3D.leftz = asset.orientation.left.z;
            scene3D.rightx = asset.orientation.right.x;
            scene3D.righty = asset.orientation.right.y;
            scene3D.rightz = asset.orientation.right.z;
            scene3D.col = asset.col;
            scene3D.row = asset.row;
            scene3D.floor = asset.floor;

            this.scenesnapshot3D.push(scene3D);
        });

        console.log("scene snapshots result", this.scenesnapshot3D);

        this.settings = this.parseSceneSettingToSetting(this.sceneSettings);
    }

    private parseSceneSettingToSetting(setting: IScene3DSetting) : ISetting[] {

        let result: ISetting[] = [];
        const settingOptions = this.settingOptionService.settingOptions$();
        Object.keys(setting).forEach((key) => {
            const settingOption = settingOptions.find((settingOption) => settingOption.key === key);
            let valueAsString;
            try {
                valueAsString = setting[key as keyof IScene3DSetting].toString();
            }
            catch {
                throw new Error(`Invalid key value. Please make sure to verify the setting value is of a parseable to string type.`);
            }

            result.push({
                user: {id: this.authService.getUser()?.id}!,
                settingOption: {id: settingOption?.id},
                value: valueAsString,
            });
        });


        return result;
    }

    public parseSettingToSceneSetting(setting: ISetting[]) : IScene3DSetting {
        let scene3DSetting: IScene3DSetting;
        try {
            scene3DSetting = PersistenceHandler.asObject(setting) as IScene3DSetting;
        }
        
        catch {
            throw new Error(`Object Parsing error. There is a SettingOption that is not compatible with the Scene3DSetting.`);
        }
        return scene3DSetting;
    }
    
    public static asObject(settings: ISetting[]): Record<string, any> {
        const result: Record<string, any> = {};

        let transformedValue: any;

        settings.forEach((setting) => {
            switch (setting.settingOption.datatype!.toLowerCase()) {
                case 'number':
                transformedValue = parseFloat(setting.value);
                break;
                case 'boolean':
                transformedValue = setting.value.toLowerCase() === 'true';
                break;
                case 'json':
                try {
                    transformedValue = JSON.parse(setting.value);
                } catch {
                    console.error('Invalid JSON string:', setting.value);
                    transformedValue = setting.value;
                }
                break;
                default:
                transformedValue = setting.value; // Default to string
                break;
            }
    
            result[setting.settingOption.key!] = transformedValue;
        })

        return result;
    }

    public save() {

        this.scene3DService.saveAsSubscribe(this.scene3D).subscribe(
            {
                next: (scene3D: any) => {
                    console.log("scene3D saved");
                    const newScene3D: IScene3D = scene3D;
                    this.scenesnapshot3D.forEach((sceneSnapshot3D) => sceneSnapshot3D.scene3D = {id: newScene3D.id} as IScene3D);
                    this.settings.forEach((setting) => setting.scene3D = {id: newScene3D.id} as IScene3D);
                    console.log("updated scene snapshots");
                    console.log(this.scenesnapshot3D);
                    this.scenesnapshot3D.forEach((sceneSnapshot3D) => {
                        this.sceneSnapshot3DService.save(sceneSnapshot3D)
                    });
                    this.settings.forEach((setting) => {
                        console.log(setting);
                        this.settingService.save(setting);
                    });
                },
                error: (error) => {
                    console.log("error when parsing to scene3D");
                    console.error(error);
                }
            }
        );

    }

    public delete(scene3D: ISceneSnapshot3D) {
        this.sceneSnapshot3DService.delete(scene3D);
    }

    public update(scene3D: ISceneSnapshot3D) {
        this.sceneSnapshot3DService.update(scene3D);
    }

}