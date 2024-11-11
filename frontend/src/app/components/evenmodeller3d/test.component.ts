import { afterRender, AfterRenderRef, Component, ElementRef, inject, Input, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { getWindow } from 'ssr-window';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DebuggingUtils } from './modelobjects/3dobjects';
import { Side } from './modelobjects/3dtypes';
import { MetricType, EventGrid } from './modelobjects/events';
import { Floor } from '../../models/floor.model';
import { Chair } from '../../models/chair.model';
import { ChairSet, Event3DManager, Direction } from './modelobjects/event3dmanager';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Ui3DComponent } from '../../ui3d/ui3d.component';
import * as UICommand from '../../ui3d/commands/commands';
import { AssetModel } from '../../interfaces';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ModelService } from '../../services/model.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [HttpClientModule, Ui3DComponent, CommonModule],
  providers: [HttpClientModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {

  @ViewChild("mainThreeCv", {static: false}) mainThreeCv!: ElementRef<HTMLCanvasElement>;	
  @Input() modelMetadata: AssetModel[] = [];
  @Input() images: Blob[] = [];
  modelService: ModelService = inject(ModelService);
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  orbitCamera!: OrbitControls;
  grid!: EventGrid;
  eventManager!: Event3DManager;
  authService: AuthService = inject(AuthService);
  set!: ChairSet;
  isLoading: boolean = true;

  // debugging properties. Must remove later.
  defaultChair!: Chair;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {

  }

  public addComponent(addtion: UICommand.addtion) {
    

    console.log("Row: " + addtion.z);
    console.log("Col: " + addtion.x);

    this.eventManager.add(this.defaultChair, addtion.x, 0, addtion.z);

    this.eventManager.render(this.scene);

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
    const light2 = new THREE.DirectionalLight(0xffffff, 6);

    light2.position.set(0, 3, 0);
    light2.target.position.set(-4, -1, 0); 
    light2.castShadow = true;

    light2.shadow.camera = new THREE.OrthographicCamera( -100, 100, 100, -100, 0.5, 1000 ); 
    light2.shadow.mapSize.width = 1024;
    light2.shadow.mapSize.height = 1024;
    // light2.shadow.bias = -0.001;

    this.scene.add(light2);
    this.scene.add(light2.target);
    
    this.camera = new THREE.PerspectiveCamera( 50, getWindow().innerWidth / getWindow().innerHeight, 0.1, 500 );

    this.camera.position.y = 5;
    this.camera.position.z = 5;

    const canvas = this.mainThreeCv.nativeElement;
    this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize( getWindow().innerWidth / 1.4, getWindow().innerHeight / 1.2);
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
    
    //   chairSet.add({
    //     x: chair.x,
    //     y: chair.y,
    //     z: chair.z,
    //     grid: this.grid,
    //     direction1: Direction.FRONT});

    // chairSet.add({
    //   x: chair.x,
    //   y: chair.y,
    //   z: chair.z,
    //   grid: this.grid,
    //   direction1: Direction.RIGHT});

    // chairSet.add({
    //   x: chair.x,
    //   y: chair.y,
    //   z: chair.z + 1,
    //   grid: this.grid,
    //   direction1: Direction.RIGHT});

    // chairSet.add({
    //   x: chair.x,
    //   y: chair.y,
    //   z: chair.z + 2,
    //   grid: this.grid,
    //   direction1: Direction.RIGHT});

    // chairSet.add({
    //   x: chair.x,
    //   y: chair.y,
    //   z: chair.z + 3,
    //   grid: this.grid,
    //   direction1: Direction.RIGHT});

    // chairSet.add({
    //   x: chair.x,
    //   y: chair.y,
    //   z: chair.z + 2,
    //   grid: this.grid,
    //   direction1: Direction.FRONT});

    // chairSet.add({
    //   x: chair.x + 2,
    //   y: chair.y,
    //   z: chair.z + 2,
    //   grid: this.grid,
    //   direction1: Direction.FRONT});

    
    this.eventManager = new Event3DManager(this.grid);
    this.eventManager.addSet(this.set); 
    //this.eventManager.printAssets();
    this.eventManager.render(this.scene);

    DebuggingUtils.showBoundingBox(floor.content, this.scene);
    const box = new THREE.Box3().setFromObject(floor.content);

    //this.grid.moveAssetTo(chair, 2, 0, 0, Side.CENTER, Side.BOTTOM);
    //this.grid.moveAssetTo(chair2, 0, 0, 0, Side.CENTER, Side.BOTTOM);

    // DebuggingUtils.showBoundingBox(chair.content, this.scene);
    // DebuggingUtils.showBoundingBox(chair2.content, this.scene);

    this.scene.add(floor.content);
    //this.scene.add(chair.content);
    //this.scene.add(chair2.content);

    //this.grid.hide();

    //DebuggingUtils.showBoundingBox(floor.content, this.scene);
    //this.scene.add(center);

    const animate = () => {
      requestAnimationFrame(animate);
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
      this.orbitCamera.update();
    };

    animate();
  }
}
