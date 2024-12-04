import { ChangeDetectorRef, Component, effect, inject, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Simulator3DComponent } from '../../components/evenmodeller3d/3dsimulator.component';
import { Asset, AssetMetadata, AssetModel, ISceneSnapshot3D, IScene3DSetting, IScene3D, ISetting } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { ModelMetadataService } from '../../services/model-metadata.service';
import { TextureService } from '../../services/texture.service';
import { PersistenceHandler } from './persistence/persistence-handler';
import { AuthService } from '../../services/auth.service';
import { SettingService } from '../../services/setting.service';
import { SettingOptionService } from '../../services/setting-option.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SceneSelectionComponent } from './scene-selection/scene-selection/scene-selection.component';
import { SceneSnapshot3DService } from '../../services/scenesnapshot3d.service';
import { Scene3DService } from '../../services/scene3d.service';

@Component({
  selector: 'app-event-modeller',
  standalone: true,
  imports: [Simulator3DComponent, CommonModule],
  templateUrl: './eventmodeller.component.html',
  styleUrls: ['./eventmodeller.component.scss']
})
export class EventModellerComponent {
  title = 'event modeller';
  modelMetadata: AssetMetadata[] = [];
  // images: Blob[] = [];
  isLoading: boolean = true;
  modelService: ModelMetadataService = inject(ModelMetadataService);
  textureService: TextureService = inject(TextureService);
  authService: any = inject(AuthService);
  settingService: any = inject(SettingService);
  settingOptionsService: any = inject(SettingOptionService);
  scene3DService: any = inject(Scene3DService);
  sceneSnapshot3DService: any = inject(SceneSnapshot3DService);
  sceneSelectionComponentRef: any = MatDialogRef<SceneSelectionComponent>;
  dialog: any = inject(MatDialog);

  settings: IScene3DSetting = {} as IScene3DSetting;
  scene3DSnapshots: ISceneSnapshot3D[] = [];
  scene3D: IScene3D = {} as IScene3D;

  persistenceHandler!: PersistenceHandler;

  constructor() {
    this.modelService.getAll();
    this.textureService.getAll();
    this.sceneSnapshot3DService.getAll();
    this.scene3DService.getAll();
    this.settingService.getAll();
    this.settingOptionsService.getAll();

    effect(() => {
      if (this.modelService.models$().length > 0) {
        const models = this.modelService.models$();
        this.modelService.getModels(models);
      }
    });

    effect(() => {
      if (this.modelService.modelModels$().length > 0) {
        this.modelService.modelModels$();
      }
    });

    effect(() => {
      if (this.modelService.models$().length > 0 && this.modelService.models$().length === this.modelService.search.totalElements) {
        const models = this.modelService.models$();
        this.modelService.getTextures(models);
      }
    });

    effect(() => {
      if (this.textureService.textures$().length > 0 && this.textureService.textures$().length === this.textureService.search.totalElements) {
        const textures = this.textureService.textures$();
        this.textureService.getTextures(textures);
      }
    })
  }

  saveScene(sceneDetails: {scene3D: IScene3D, assets: Asset[], settings: IScene3DSetting}) {
    console.log("saving scene in event modeller", sceneDetails.assets);
    this.persistenceHandler = new PersistenceHandler(sceneDetails.scene3D, sceneDetails.assets, sceneDetails.settings, this.scene3DService, this.sceneSnapshot3DService, this.settingService, this.settingOptionsService, this.authService);
    this.persistenceHandler.init();
    this.persistenceHandler.save();
  }

  openSceneSelection() {
    this.sceneSelectionComponentRef = this.dialog.open(SceneSelectionComponent, {
      width: '800px',
      height: '600px', 
      data: {
        scene3D: this.scene3DService.scene3D$()
      }
    });

    this.sceneSelectionComponentRef.componentInstance.openedSceneSelected.subscribe((scene3D: IScene3D) => {
      this.scene3D = scene3D;
      this.sceneSelectionComponentRef.close();
      const settings = this.settingService.setting$();
      this.settings = PersistenceHandler.asObject(settings.filter((setting: ISetting) => setting.scene3D!.id === scene3D.id)) as IScene3DSetting;

      const sceneSnapshots = this.sceneSnapshot3DService.sceneSnapshot3D$();
      this.scene3DSnapshots = sceneSnapshots.filter((sceneSnapshot3D: ISceneSnapshot3D) => sceneSnapshot3D.scene3D!.id === scene3D.id) as ISceneSnapshot3D[];
    })

    this.sceneSelectionComponentRef.componentInstance.deleteSceneAction.subscribe((scene3D: IScene3D) => {
      console.log("deleting scene");
      this.scene3DService.delete(scene3D);
      this.scene3DService.getAll();
      this.sceneSelectionComponentRef.close();
    })
  }
}