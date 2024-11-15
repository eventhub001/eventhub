import * as THREE from 'three';
import { NMatrix } from './matrices';
import { ThreeCalculationUtils } from './vectorutils';
import { ThreeDObject } from '../models/threeobject.model';
import { Asset } from '../../../interfaces';
import { Side } from './3dtypes';

export enum EventType {
    Party,
    Wedding,
    Birthday,
    Conference,
    Meeting,
    Other
}

export enum MetricType {
    Meters,
    Feet,
    Inches,
    Centimeters
}

export class EventGrid {
    nMatrix: NMatrix<ThreeDObject>;
    cols: number;
    floor: number;
    rows: number;
    width: number;
    height: number;
    depth: number;
    metric: MetricType;
    model: THREE.Object3D;

    constructor(width: number, height: number, depth: number, metric: MetricType) {
        this.cols = 21;
        this.floor = 3;
        this.rows = 10;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.metric = metric;
        this.nMatrix = new NMatrix<ThreeDObject>(this.cols, this.floor, this.rows, null);

        this.model = this.createAsThreeJSObject();
    }

    // debugging. Must remove later.
    public createAsThreeJSObject() : THREE.Object3D {
        // make everything as lines
        const cube = new THREE.Object3D();
        const material = new THREE.LineBasicMaterial({color: 0x0000ff});
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, material);
        cube.position.y += this.height / 2;

        const furthestPointx = cube.position.x - this.width / 2;
        const furthestPointz = cube.position.z - this.depth / 2;
        const furthestPointy = cube.position.y - this.height / 2;

        // make the grid
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                for (let k = 0; k < this.floor; k++) {
                    const material = new THREE.LineDashedMaterial({
                        color: 0x0000ff,
                        linewidth: 1,
                        scale: 3,
                        dashSize: 0.5,
                        gapSize: 1,});
                    //const material = new THREE.LineBasicMaterial({color: 0x0000ff});
                    const geometry = new THREE.BoxGeometry((this.width / this.cols), (this.height / this.floor), (this.depth / this.rows));
                    const edges = new THREE.EdgesGeometry(geometry);
                    const lineS = new THREE.LineSegments(edges, material);
                    lineS.computeLineDistances();
                    material.transparent = true;
                    material.opacity = 0.2;
                    lineS.position.x = furthestPointx + i * (this.width / this.cols) + (this.width / this.cols) / 2;
                    lineS.position.z = furthestPointz + j * (this.depth / this.rows) + (this.depth / this.rows) / 2;
                    lineS.position.y = furthestPointy + k * (this.height / this.floor) + (this.height / this.floor) / 2 - this.height / 2;
                    cube.add(lineS);
                }
            }
            
        }

        cube.add(line);

        return cube;
    }

    public hide() {
        if (this.model !== undefined) {
            this.model.visible = false;
        }
    }

    public calculateDimensionTaken(asset: THREE.Object3D) : number[][] {
        const positionAsset = ThreeCalculationUtils.getAbsolutePosition(asset);
        if (this.model === undefined) {
            throw new Error("Grid model is not defined. Please make sure to create the grid model first.");
        }

        const positionGrid = ThreeCalculationUtils.getAbsolutePosition(this.model);

        const fixedPositionAsset = positionAsset.map((point) => {
            return new THREE.Vector3(point.x - positionGrid[0].x, point.y - positionGrid[0].y, point.z - positionGrid[0].z);
        })

        let indexpos: number[][] = [];
        for (let i = 0; i < fixedPositionAsset.length; i++) {
            const ix1 = Math.floor(fixedPositionAsset[i].x / (this.width / this.cols));
            const iy1 = Math.floor(fixedPositionAsset[i].y / (this.height / this.floor));
            const iz1 = Math.floor(fixedPositionAsset[i].z / (this.depth / this.rows));
            
            indexpos.push([ix1, iy1, iz1]);
        }
        
        return indexpos;
    }

    private getPosMatrix(x: number, y: number, z: number) {

        if (this.model === undefined) {
            throw new Error("Grid model is not defined. Please make sure to create the grid model first.");
        }

        const positionGrid = ThreeCalculationUtils.getAbsolutePosition(this.model);
        const positionPoint = new THREE.Vector3(
            positionGrid[0].x + (this.width / this.cols) * x,
            positionGrid[0].y + (this.height / this.cols) * y,
            positionGrid[0].z + (this.depth / this.rows) * z
        );

        return positionPoint;

    }

    public get(x: number, y: number, z: number) {
        return this.nMatrix.get(x, y, z);
    }

    public placeAssetTo(threeobject: Asset, x: number, y: number, z: number, side1: Side, side2: Side) {
        // move to a specific place in the grid, the numbers must be integers and always moves it to the center.
        if (side1 === side2 && side1 !== Side.CENTER) {
            throw new Error("You need to specify two different sides for sides different than 'CENTER'.");
        }
        
        const boxInGridPos = this.getPosMatrix(x, y, z);

        const positionAsset = ThreeCalculationUtils.getAbsolutePosition(threeobject.content); 
        
        const assetBoundingBox = new THREE.Box3().setFromObject(threeobject.content);
        const boxSize = assetBoundingBox.getSize(new THREE.Vector3());

        const boxWidth = this.width / this.cols;
        const boxHeight = this.height / this.floor;
        const boxDepth = this.depth / this.rows;
        //if (side1 === Side.CENTER || side2 === Side.CENTER) {
        threeobject.content.position.x = boxInGridPos.x + boxWidth / 2;
        threeobject.content.position.y = boxInGridPos.y + boxHeight / 2;
        threeobject.content.position.z = boxInGridPos.z + boxDepth / 2;
        //}

        if (side1 === Side.BOTTOM || side2 === Side.BOTTOM) {
            threeobject.content.position.y = boxInGridPos.y + (boxSize.y / 2);
        }

        if (side1 === Side.BACK || side2 === Side.BACK) {
            threeobject.content.position.x = boxInGridPos.x + (boxSize.x / 2);
        }

        if (side1 === Side.LEFT || side2 === Side.LEFT) {
            threeobject.content.position.z = boxInGridPos.z + (boxSize.z / 2);
        }

        // if the object is located at the edge of the event then fix so it doesn't go out of the grid.
        if (x === 0 && boxSize.x > boxWidth) {
            threeobject.content.position.x = boxInGridPos.x + (boxSize.x / 2);
        }

        if (z === 0 && boxSize.z > boxDepth) {
            threeobject.content.position.z = boxInGridPos.z + (boxSize.z / 2);
        }

        return threeobject;
    }

}

export class Event {
    type: EventType;
    
    constructor(type: EventType) {
        this.type = type;
    }

    public getType() {
        return this.type;
    }

    public setType(type: EventType) {
        this.type = type;
    }

    public toString() {
        return this.type;
    }
}