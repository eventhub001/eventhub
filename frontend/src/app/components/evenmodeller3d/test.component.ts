import { afterRender, AfterRenderRef, Component, ElementRef, inject, Input, Signal, signal, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { getWindow } from 'ssr-window';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DebuggingUtils } from './modelobjects/3dobjects';
import { Side } from './modelobjects/3dtypes';
import { MetricType, EventGrid } from './modelobjects/events';
import { Floor } from './models/floor.model';
import { Chair } from './models/chair.model';
import { ChairSet, Event3DManager, Direction } from './modelobjects/event3dmanager';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Ui3DComponent } from '../../ui3d/ui3d.component';
import * as UICommand from '../../ui3d/commands/commands';
import { Asset, AssetImg, AssetModel } from '../../interfaces';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ModelService } from '../../services/model.service';
import { directionToProjection, fixProjectionMapping } from './projections/camera';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [HttpClientModule, Ui3DComponent, CommonModule],
  providers: [HttpClientModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  @ViewChild("mainThreeCv", {static: false}) mainThreeCv!: ElementRef<HTMLCanvasElement>;	
  @Input() modelMetadata: AssetModel[] = [];
  @Input() images: AssetImg[] = [];
  modelService: ModelService = inject(ModelService);
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  orbitCamera!: OrbitControls;
  grid!: EventGrid;
  pointer! : THREE.Vector2;
  intersector!: THREE.Raycaster;
  selectionsBox: THREE.Box3Helper[] = [];

  selectedAsset: ({asset: Asset, position: {col: number; floor: number; row: number}})[] = [];
  selectedFloor: THREE.Object3D | null = null;

  eventManager!: Event3DManager;
  authService: AuthService = inject(AuthService);
  set!: ChairSet;
  isLoading: boolean = true;

  arrowToProjection: directionToProjection = {
    ['up']:{x: 0, y: 0, z: -1},
    ['down']:{x: 0, y: 0, z: 1},
    ['left']:{x: -1, y: 0, z: 0},
    ['right']:{x: 1, y: 0, z: 0},
  };

  arrowToProjectionSignal: Signal<directionToProjection> = signal(this.arrowToProjection);
  // debugging properties. Must remove later.
  defaultChair!: Chair;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {

  }

  public addComponent(addtion: UICommand.addtion) {
    
    if (addtion.id) {
      console.log("Row: " + this.selectedFloor?.userData["x"]);
      console.log("Col: " + this.selectedFloor?.userData["z"]);
      this.eventManager.add(this.defaultChair, this.selectedFloor?.userData["x"], 0, this.selectedFloor?.userData["z"]);
      this.eventManager.render(this.scene);
      return;
    }

    console.log("Row: " + addtion.z);
    console.log("Col: " + addtion.x);

    if (addtion.x == null || addtion.z == null) {
      throw new Error('Invalid addtion operation. Please select a row and a column.');
    }

    this.eventManager.add(this.defaultChair, addtion.x!, 0, addtion.z!);

    this.eventManager.render(this.scene);

  }

  public moveComponent(move: UICommand.move) {

    console.log("Row: " + move.z);
    console.log("Col: " + move.x);

    this.eventManager.move(this.selectedAsset[0], move.x, 0, move.z);
    this.eventManager.render(this.scene);

    this.updateSelection(this.selectedAsset[0].asset.content);
  }

  addRenderingHelpers() {
    // add rendering helpers here
    this.orbitCamera = new OrbitControls(this.camera, this.renderer.domElement);
    const axesHelper = new THREE.AxesHelper(5);
    //this.scene.add(axesHelper);
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
    
    this.camera = new THREE.PerspectiveCamera( 50, getWindow().innerWidth / getWindow().innerHeight, 0.1, 500 );

    this.camera.position.y = 5;
    this.camera.position.z = 5;

    const canvas = this.mainThreeCv.nativeElement;
    this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize( getWindow().innerWidth / 1.8, getWindow().innerHeight / 1.2);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("modelMetadata", this.modelMetadata);
    console.log("images", this.images);
    if (changes["images"]) {
      if (this.images.length > 0) {
        this.isLoading = false;
        console.log('finished loading');
      }

    }
  }

  async ngAfterViewInit() {
    //new zim.Frame(zim.FIT, 800, 600, "#ff0000", 1);
    this.setupComponents();

    this.grid = new EventGrid(20, 3, 15, MetricType.Meters);

    // resize canvas on half the size
    this.addRenderingHelpers();

    
    const token = this.authService.getAccessToken();

    const floor = await Floor.createFromModel(20, 15,
      token!,
      1,
      {x: 0, y: 0, z: 0},
      this.http,
      {front: new THREE.Vector3(1, 0, 0), right: new THREE.Vector3(1, 0, 0), top: new THREE.Vector3(0, 1, 0)});

    DebuggingUtils.showSide(floor, Side.TOP, this.scene);

    const chair = await Chair.createFromModel(
      token!,
      1,
      {width: 1.2711153278258065, height:2.3832655070864464, depth: 1.0580182533765168},
      {x: 0, y: 0, z: 0},
      this.http,
      {front: new THREE.Vector3(0, 0, 1), right: new THREE.Vector3(0, 0, 1), top: new THREE.Vector3(0, 1, 0)}
    );

    this.defaultChair = chair;

    DebuggingUtils.showLights(floor.content);

    this.scene.add(this.grid.model);
    this.scene.add(this.grid.floorGrid);

    this.set = new ChairSet("left", this.grid, chair);

    this.set.add({
      col: chair.x,
      floor: chair.y,
      row: chair.z,
      grid: this.grid,
      direction1: Direction.FRONT});

    this.set.add({
      col: chair.x + 2,
      floor: chair.y,
      row: chair.z,
      grid: this.grid,
      direction1: Direction.FRONT});

    this.intersector = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(); 
    this.intersector.setFromCamera(this.pointer, this.camera);

    this.eventManager = new Event3DManager(this.grid);
    this.eventManager.addSet(this.set); 
    //this.eventManager.printAssets();
    this.eventManager.render(this.scene);

    DebuggingUtils.showBoundingBox(floor.content, this.scene);
    const box = new THREE.Box3().setFromObject(floor.content);

    this.scene.add(floor.content);

    const animate = () => {
      requestAnimationFrame(animate);
      this.camera.updateProjectionMatrix();
      const direction: THREE.Vector3 = this.camera.getWorldDirection(new THREE.Vector3());
      console.log(direction.z);
      fixProjectionMapping(this.arrowToProjection, direction);
      
      this.renderer.render(this.scene, this.camera);
      this.orbitCamera.update();
    };

    animate();
  }

  
  selectAsset(event: MouseEvent) {
    this.pointer.x = (event.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.pointer.y = -(event.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;
    
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

    else {
      this.eventManager.getAssetsAsObjects().forEach((asset) => {
        // revert the material back to the original.
        this.clearBoundingBoxes();
        this.selectedAsset = [];
      });
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
      console.log("selecting floor");
      const mesh = mode as THREE.Mesh;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.color = new THREE.Color(0xff0000);
      mode.visible = true;

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
}
