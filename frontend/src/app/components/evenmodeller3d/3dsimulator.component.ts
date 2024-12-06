import { afterRender, AfterRenderRef, Component, computed, effect, ElementRef, EventEmitter, inject, Input, Output, Signal, signal, SimpleChange, SimpleChanges, ViewChild, WritableSignal } from '@angular/core';
import * as THREE from 'three';
import { getWindow } from 'ssr-window';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DebuggingUtils, getLastParentBefore } from './utils/3dobjects-utils';
import { Side } from './modeller-objects/3dtypes';
import { MetricType, EventGrid } from './modeller-objects/grid';
import { Floor } from './models/floor.model';
import { DefaultThreeDObject } from './models/default.model';
import { Event3DManager } from './modeller-objects/event3dmanager';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Asset, AssetImg, AssetMetadata, AssetModel, AssetTexture, ISceneSnapshot3D, IScene3DSetting, IScene3D } from '../../interfaces';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ModelMetadataService } from '../../services/model-metadata.service';
import { fixProjectionMapping, fixRotationMapping } from './input-projections/camera';
import * as UICommand from '../ui3d/commands/commands';
import { Ui3DComponent } from '../ui3d/ui3d.component';
import { SELECTIONTYPE } from '../ui3d/menus/arrows';
import { arrowToAxis, isSameArrowsToAxis } from './input-projections/movement';
import { arrowsToRotation, isSameArrowsToRotation } from './input-projections/rotation';
import { ThreeDObject } from './models/threeobject.model';
import { GridAdditionError } from './exceptions/exceptions';
import { AlertService } from '../../services/alert.service';
import { ModelHandler, TextureHandler } from '../../services/models-parse.service';
import { TextureService } from '../../services/texture.service';
import { SettingService } from '../../services/setting.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SaveDialogComponent } from './save-dialog/save-dialog/save-dialog.component';
import { SceneLoader } from './models/scene-loader';
import { Set } from './modeller-objects/sets';
import { LoaderComponent } from '../loader/loader.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-3dsimulator',
  standalone: true,
  imports: [Ui3DComponent, CommonModule, LoaderComponent],
  templateUrl: './3dsimulator.component.html',
  styleUrl: './3dsimulator.component.scss'
})
export class Simulator3DComponent {

  @ViewChild("mainThreeCv", {static: false}) mainThreeCv!: ElementRef<HTMLCanvasElement>;	
  @Input() modelMetadata: AssetMetadata[] = [];
  @Input() images: AssetImg[] = [];
  @Input() models: AssetModel[] = [];
  @Input() textures: AssetTexture[] = [];

  @Input() scene3DLoaded: IScene3D | null = null;
  @Input() sceneSnapshotsLoaded: ISceneSnapshot3D[] | null = null;
  @Input() sceneSettingsLoaded: IScene3DSetting | null = null;
  alertService: any = inject(AlertService);

  @Output() callSaveAction: EventEmitter<{scene3D: IScene3D, assets: Asset[], settings: IScene3DSetting}> = new EventEmitter<{scene3D: IScene3D, assets: Asset[], settings: IScene3DSetting}>();
  @Output() showSceneSelectionAction: EventEmitter<void> = new EventEmitter<void>();
  modelHandler!: ModelHandler;
  isUILoading: boolean = true;
  is3DLoading: boolean = true;


  sceneSettings: IScene3DSetting = {
    floorTextureId: 1,
    width: 20,
    depth: 15,
    cols: 21,
    rows: 10
  } as IScene3DSetting;

  modelService: ModelMetadataService = inject(ModelMetadataService);
  textureService: TextureService = inject(TextureService);
  settingService: SettingService = inject(SettingService);

  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  orbitCamera!: OrbitControls;
  grid!: EventGrid;
  pointer! : THREE.Vector2;
  intersector!: THREE.Raycaster;
  selectionsBox: THREE.Box3Helper[] = [];

  sceneLoader: SceneLoader = new SceneLoader();

  selectedAsset: ({asset: Asset, position: {col: number; floor: number; row: number}})[] = [];
  selectedFloor: THREE.Object3D | null = null;

  eventManager!: Event3DManager;
  authService: AuthService = inject(AuthService);
  set!: Set;

  mousePosition: {x: number, y: number} = {x: 0, y: 0};

  // dialogs
  saveDialogRef: any = MatDialogRef<SaveDialogComponent>;

  dialog = inject(MatDialog);

  arrowToProjection: arrowToAxis = {
    ['up']: { x: 0, y: 0, z: -1 },
    ['down']: { x: 0, y: 0, z: 1 },
    ['left']: { x: -1, y: 0, z: 0 },
    ['right']: { x: 1, y: 0, z: 0 }
  };
  
  arrowsToRotation: arrowsToRotation = {
    ['up']: 270,
    ['down']: 90,
    ['left']: 180,
    ['right']: 0
  }

  arrowsToProjectionSignal: WritableSignal<arrowToAxis> = signal<arrowToAxis>(this.arrowToProjection, {equal: isSameArrowsToAxis});
  arrowsToRotationSignal: WritableSignal<arrowsToRotation> = signal<arrowsToRotation>(this.arrowsToRotation, {equal: isSameArrowsToRotation});
  get arrowsToProjection$() {
    return this.arrowsToProjectionSignal;
  }

  get arrowsToRotation$() {
    return this.arrowsToRotationSignal;
  }
  // debugging properties. Must remove later.
  defaultChair!: DefaultThreeDObject;
  modelsMenu: ThreeDObject[] = [];
  modelsContentMenu!: Record<number, THREE.Object3D>;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {

  }

  public addComponent(addtion: UICommand.addtion) {
    
    if (addtion.id) {

      const model = this.modelsMenu.find(model => model.id == addtion.id);
      console.log(model);
      try {
        this.eventManager.computeSpatialObjectOccupancy(model!, this.selectedFloor?.userData["x"], 0, this.selectedFloor?.userData["z"], this.scene);
      }

      catch (e) {
        if (e instanceof GridAdditionError) {
          this.alertService.displayAlert("error", "No se puede colocar el inmobiliario en la posición seleccionada. Por favor, seleccione otra posición.", "center", "top", ["error-snackbar"]);
        }

        console.error("Unhandled error:", e);
        this.alertService.displayAlert(
          "error",
          "Un error inesperado ha ocurrido. Por favor, inténtalo de nuevo.",
          "center",
          "top",
          ["error-snackbar"]
        );
      }
      this.eventManager.render(this.scene);

      if (addtion.x === null || addtion.z === null) {
        throw new Error('Invalid addtion operation. Please select a row and a column.');
      }
    }

  }

  public handleDirectionComponent(direction: UICommand.directional) {

    if (direction.direction == SELECTIONTYPE.ROTATE) {
      console.log("Rotating asset from UI selection");
      this.eventManager.rotate(this.selectedAsset[0], direction.x, 0, direction.z);
      this.eventManager.render(this.scene);
      this.updateSelection(this.selectedAsset[0].asset.content);
      return;
    }

    try {
      this.eventManager.move(this.selectedAsset[0], direction.x, 0, direction.z);
    }
    catch (e) {
      if (e instanceof GridAdditionError) {
        this.alertService.displayAlert("error", "No se puede colocar el inmobiliario en la posición seleccionada. Por favor, seleccione otra posición.", "center", "top", ["error-snackbar"]);
      }
    }

    this.eventManager.render(this.scene);
    this.updateSelection(this.selectedAsset[0].asset.content);
  }

  public deleteSelectedComponent() {

    this.eventManager.delete(this.selectedAsset[0], this.scene); 
    this.eventManager.render(this.scene);

    this.clearSelection();
  }

  addRenderingHelpers() {
    this.orbitCamera = new OrbitControls(this.camera, this.renderer.domElement);
  }

  setupComponents() {

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.backgroundBlurriness = 0.5;

    const light = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(light);
    const light2 = new THREE.DirectionalLight(0xffffff, 7);

    light2.position.set(8, 5, 0);
    light2.target.position.set(-1, -1, 0); 
    light2.castShadow = true;
    light2.shadow.camera.left = -20;
    light2.shadow.camera.right = 20;
    light2.shadow.camera.top = 40;
    light2.shadow.camera.bottom = -40;

    this.scene.add(light2);
    this.scene.add(light2.target);
    
    this.camera = new THREE.PerspectiveCamera( 50, getWindow().innerWidth / getWindow().innerHeight * 1.4, 0.1, 500 );

    this.camera.position.y = 5;
    this.camera.position.z = 5;

    const canvas = this.mainThreeCv.nativeElement;
    this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize( getWindow().innerWidth / 1.1, getWindow().innerHeight / 1.2);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["textures"] && this.textures.length > 0) {
      if (this.textures.length === this.textureService.search.totalElements) {
        this.is3DLoading = false;
        this.loadModeler();
      }
    }
    
    if (this.images.length > 0 && this.models.length > 0 && this.images.length === this.modelService.search.totalElements) {
      this.isUILoading = false;
    }

    if (changes["scene3DLoaded"]) {
      console.log("load scene");
      this.loadScene();
    }
  }


  async loadModeler() {
    
    if (this.scene) {
      this.scene.clear();
    }

    console.log("loading world");
    this.setupComponents();

    this.grid = new EventGrid(this.sceneSettings.width, 8, this.sceneSettings.depth, this.sceneSettings.cols, this.sceneSettings.rows, MetricType.Meters);

    console.log(this.grid);
    // resize canvas on half the size
    this.addRenderingHelpers();

    this.modelsContentMenu = await this.sceneLoader.mapContentsToModel(this.models);
    
    const floorTexture = await TextureHandler.parseTextureBlob(this.textures[0].blob!);

    const floor = new Floor(this.sceneSettings.width, this.sceneSettings.depth, {x: 0, y: 0, z: 0}, "", undefined, undefined, floorTexture);

    this.modelsMenu = await this.sceneLoader.createThreeDObjects(this.modelMetadata, this.models);

    DebuggingUtils.showLights(floor.content);
 
    this.scene.add(this.grid.model);
    this.scene.add(this.grid.floorGrid);

    this.set = new Set("left", this.grid, this.modelsMenu[0]);

    this.intersector = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(); 
    this.intersector.setFromCamera(this.pointer, this.camera);

    this.eventManager = new Event3DManager(this.grid);

    this.eventManager.render(this.scene);

    DebuggingUtils.showBoundingBox(floor.content, this.scene);

    this.scene.add(floor.content);

    const animate = () => {
      requestAnimationFrame(animate);
      this.camera.updateProjectionMatrix();
      const direction: THREE.Vector3 = this.camera.getWorldDirection(new THREE.Vector3());
      const projectionArrowMapping = fixProjectionMapping(this.arrowToProjection, this.camera.position, direction);
      this.arrowsToProjectionSignal.set(projectionArrowMapping);
      this.arrowsToRotationSignal.set(fixRotationMapping(projectionArrowMapping));

      this.renderer.render(this.scene, this.camera);
      this.orbitCamera.update();
    };

    animate();
  }

  mouseDown(event: MouseEvent) {
    this.mousePosition.x = (event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mousePosition.y = (event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;
  }
  
  selectAsset(event: MouseEvent) {
  
    this.pointer.x = (event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.pointer.y = -(event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;

    if (
      this.mousePosition.x !== this.pointer.x &&
      this.mousePosition.y !== this.pointer.x
    )
    {
      return;
    }
    
    this.intersector.setFromCamera(this.pointer, this.camera);

    const intersections = this.intersector.intersectObjects([...this.eventManager.getAssetsAsObjects(), this.grid.floorGrid], true);

    if (intersections.length > 0) {

      if (this.selectionsBox.length > 0) {
        this.clearBoundingBoxes();
        this.selectedAsset = [];
      }

      console.log(intersections);
      if (intersections[0].object.name === "floor") {
        this.updateSelection(intersections[0].object);
        return;
      } 

      const object = getLastParentBefore(this.scene.uuid, intersections[0].object);


      this.updateSelection(object!);

      console.log(object!);
    }
  }

  showBoundingBox(model: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(model);
    const boxHelper = new THREE.Box3Helper(box, 0xfe04ff);

    this.scene.add(boxHelper);

    this.selectionsBox.push(boxHelper);
  }

  clearBoundingBoxes() {
    this.selectionsBox.forEach((box) => {
      this.scene.remove(box);
    });

    this.selectionsBox = [];
  }

  updateSelectionBoundingBox(mode: THREE.Object3D) {
    this.clearBoundingBoxes();
    this.showBoundingBox(mode);
  }

  updateSelection(mode: THREE.Object3D) {
    if (mode.name === "floor") {
      const mesh = mode as THREE.Mesh;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.color = new THREE.Color(0xff0000);
      mode.visible = true;
      mesh.receiveShadow = true;

      if (this.selectedFloor) {
        this.selectedFloor.visible = false;
        this.selectedFloor = mode;
      }

      else {
        this.selectedFloor = mode;
      }
      return;
    }

    this.updateSelectionBoundingBox(mode);
    const selectedAsset = this.eventManager.findAssetFromObject(mode.uuid);

    if (selectedAsset) {
      this.selectedAsset = [];
      this.selectedAsset.push(selectedAsset);
    }
  }

  updateArrowControlsVector() {
    const direction: THREE.Vector3 = this.camera.getWorldDirection(new THREE.Vector3());
    if (direction.x < 1.001) {
      console.log("horizontal+");
    }
  }

  clearSelection() {
    this.selectedAsset = [];
    this.clearBoundingBoxes();
  }

  saveScene() {
    this.eventManager.printAssets();
    const assets = this.eventManager.getAssets();
    
    this.saveDialogRef = this.dialog.open(SaveDialogComponent);

    this.saveDialogRef.componentInstance.callSaveAction.subscribe((data: IScene3D) => {
      console.log("saving scene", assets);
      this.callSaveAction.emit({scene3D: data, assets: assets, settings: this.sceneSettings});
      this.saveDialogRef.close();
    })
  }

  async loadScene() {
    if (this.sceneSettingsLoaded?.cols) {      
      this.sceneSettings = this.sceneSettingsLoaded!;
      console.log("loading grid settings");
      await this.loadModeler();
    }
    let modelsUpdated : Asset[] = [];

    console.log(this.sceneSnapshotsLoaded);

    this.sceneSnapshotsLoaded?.forEach((sceneSnapshot) => {

      const modelMetadata: AssetMetadata = this.modelMetadata.find((modelMetadata) => modelMetadata.id === sceneSnapshot.model.id)!;

      const model = new DefaultThreeDObject(
        sceneSnapshot.model.id,
        sceneSnapshot.model.modelPath,
        {
          width: modelMetadata.width,
          height: modelMetadata.height,
          depth: modelMetadata.depth
        },
        this.modelsContentMenu[sceneSnapshot.model.id]!.clone(),
        {
          x: sceneSnapshot.x,
          y: sceneSnapshot.y,
          z: sceneSnapshot.z
        },
        {
          front: new THREE.Vector3(sceneSnapshot.frontx, sceneSnapshot.fronty, sceneSnapshot.frontz),
          right: new THREE.Vector3(sceneSnapshot.rightx, sceneSnapshot.righty, sceneSnapshot.rightz),
          top: new THREE.Vector3(sceneSnapshot.topx, sceneSnapshot.topy, sceneSnapshot.topz)
        },
        undefined,
        sceneSnapshot.col,
        sceneSnapshot.floor,
        sceneSnapshot.row
      );
      modelsUpdated.push(model);
    });


    this.eventManager.deleteAll(this.scene);

    this.eventManager = new Event3DManager(this.grid);

    modelsUpdated.forEach((model) => {
      this.eventManager.load(model);
    });

    this.eventManager.render(this.scene);
  }

  showLoadSceneDialog() {
    this.showSceneSelectionAction.emit();
  }

  handleSettings(settings: IScene3DSetting) {
    this.sceneSettings = settings;
    console.log("scene settings updated");
    console.log(this.sceneSettings);

    this.grid = new EventGrid(this.sceneSettings.width, 3, this.sceneSettings.depth, this.sceneSettings.cols, this.sceneSettings.rows, MetricType.Meters);
    this.eventManager = new Event3DManager(this.grid);

    this.loadModeler();
  }

  handleMatrizView(show : boolean) {
    console.log("toggling matriz visibility", show);
    show ? this.grid.show() : this.grid.hide();
    this.renderer.render(this.scene, this.camera);
  }
}
