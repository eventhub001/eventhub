import { afterRender, AfterRenderRef, Component, computed, effect, ElementRef, inject, Input, Signal, signal, SimpleChange, SimpleChanges, ViewChild, WritableSignal } from '@angular/core';
import * as THREE from 'three';
import { getWindow } from 'ssr-window';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DebuggingUtils } from './model-objects/3dobjects-utils';
import { Side } from './model-objects/3dtypes';
import { MetricType, EventGrid } from './model-objects/grid';
import { Floor } from './models/floor.model';
import { DefaultThreeDObject } from './models/default.model';
import { ChairSet, Event3DManager, Direction, Set } from './model-objects/event3dmanager';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Asset, AssetImg, AssetMetadata, AssetModel, AssetTexture } from '../../interfaces';
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
import { GridAdditionError } from './model-objects/exceptions';
import { AlertService } from '../../services/alert.service';
import { ModelHandler, TextureHandler } from '../../services/modelsHandler';
import { TextureService } from '../../services/texture.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-3dsimulator',
  standalone: true,
  imports: [HttpClientModule, Ui3DComponent, CommonModule],
  providers: [HttpClientModule],
  templateUrl: './3dsimulator.component.html',
  styleUrl: './3dsimulator.component.scss'
})
export class TestComponent {

  @ViewChild("mainThreeCv", {static: false}) mainThreeCv!: ElementRef<HTMLCanvasElement>;	
  @Input() modelMetadata: AssetMetadata[] = [];
  @Input() images: AssetImg[] = [];
  @Input() models: AssetModel[] = [];
  @Input() textures: AssetTexture[] = [];
  modelHandler!: ModelHandler;
  isUILoading: boolean = true;
  is3DLoading: boolean = true;

  modelService: ModelMetadataService = inject(ModelMetadataService);
  textureService: TextureService = inject(TextureService);
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  orbitCamera!: OrbitControls;
  grid!: EventGrid;
  pointer! : THREE.Vector2;
  intersector!: THREE.Raycaster;
  selectionsBox: THREE.Box3Helper[] = [];
  alertService: any = inject(AlertService);

  selectedAsset: ({asset: Asset, position: {col: number; floor: number; row: number}})[] = [];
  selectedFloor: THREE.Object3D | null = null;

  eventManager!: Event3DManager;
  authService: AuthService = inject(AuthService);
  set!: ChairSet;

  mousePosition: {x: number, y: number} = {x: 0, y: 0};

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

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {

  }

  public addComponent(addtion: UICommand.addtion) {
    
    if (addtion.id) {

      const model = this.modelsMenu.find(model => model.id == addtion.id);
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
          "An unexpected error occurred. Please try again.",
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

    console.log(direction);
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
    // add rendering helpers here
    this.orbitCamera = new OrbitControls(this.camera, this.renderer.domElement);
  }

  setupComponents() {

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.backgroundBlurriness = 0.5;

    const light = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(light);
    const light2 = new THREE.DirectionalLight(0xffffff, 8);

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
        console.log("finished loading textures with length: " + this.textures.length);
        console.log(this.textures);
        this.loadModeler();
      }
    }
    
    if (this.images.length > 0 && this.models.length > 0 && this.images.length === this.modelService.search.totalElements) {
      this.isUILoading = false;
      console.log('finished loading images');
    }
  }


  async loadModeler() {
    console.log("loading world");
    //new zim.Frame(zim.FIT, 800, 600, "#ff0000", 1);
    this.setupComponents();

    this.grid = new EventGrid(20, 3, 15, MetricType.Meters);

    // resize canvas on half the size
    this.addRenderingHelpers();
    
    // const token = this.authService.getAccessToken();
    const floorTexture = await TextureHandler.parseTextureBlob(this.textures[0].blob!);

    const floor = new Floor(20, 15, {x: 0, y: 0, z: 0}, "", undefined, undefined, floorTexture);

    DebuggingUtils.showSide(floor, Side.TOP, this.scene);

    const chairData = this.modelMetadata[0];
    const chairModel = await ModelHandler.parseGLBFile(this.models.find(model => model.id === chairData.id)?.blob!);

    const chair = new DefaultThreeDObject(
      chairData.id,
      chairData.modelPath,
      {width: chairData!.width, height:chairData!.height, depth: chairData!.depth},
      chairModel,
      {x: chairData.x, y: chairData.y, z: chairData.z},
      {front: new THREE.Vector3(chairData.frontx, chairData.fronty, chairData.frontz), right: new THREE.Vector3(chairData.rightx, chairData.righty, chairData.rightz), top: new THREE.Vector3(chairData.topx, chairData.topy, chairData.topz)},
    )

    const tableData = this.modelMetadata[1];
    const tableModel = await ModelHandler.parseGLBFile(this.models.find(model => model.id === tableData.id)?.blob!);

    const table = new DefaultThreeDObject(
      tableData.id,
      tableData.modelPath,
      {width: tableData!.width, height:tableData!.height, depth: tableData!.depth},
      tableModel,
      {x: tableData.x, y: tableData.y, z: tableData.z},
      {front: new THREE.Vector3(tableData.frontx, tableData.fronty, tableData.frontz), right: new THREE.Vector3(tableData.rightx, tableData.righty, tableData.rightz), top: new THREE.Vector3(tableData.topx, tableData.topy, tableData.topz)}
    )

    this.modelsMenu.push(chair, table);

    this.defaultChair = chair;

    DebuggingUtils.showLights(floor.content);

    this.scene.add(this.grid.model);
    this.scene.add(this.grid.floorGrid);

    this.set = new Set("left", this.grid, chair);

    this.intersector = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(); 
    this.intersector.setFromCamera(this.pointer, this.camera);

    this.eventManager = new Event3DManager(this.grid);
    this.eventManager.addSet(this.set); 
    //this.eventManager.printAssets();
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
    const pointerUpX = this.pointer.x;
    const pointerUpY = this.pointer.y;
  
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

      const object = intersections[0].object.parent as THREE.Mesh;

      this.updateSelection(object.parent!);
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
}
