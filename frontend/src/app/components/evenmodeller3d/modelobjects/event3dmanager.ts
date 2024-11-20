import { EventType } from "@angular/router";
import { ThreeDObject } from "../models/threeobject.model";
import { EventGrid } from "./events";
import { Chair } from "../models/chair.model";
import { NMatrix } from "./matrices";
import { Side } from "./3dtypes";
import * as THREE from 'three';
import { Asset } from "../../../interfaces";

export class Event3DManager {

    sets: Set[] = [];
    grid: EventGrid;

    constructor(grid: EventGrid) {
        this.sets = [];
        this.grid = grid;
    }

    add(asset: Asset, col: number, floor: number, row: number) {
        const newasset = asset.clone();

        let allowedPosition = true;
        // verify if there a set created
        this.sets.forEach((set) => {
            if (set.hasAssetInPosition(col, floor, row)) {
                throw new Error("There is already an asset is the position selected");
            }

            else {

                newasset.x = col;
                newasset.y = floor;
                newasset.z = row;
            }
        });

        if (allowedPosition) {
            const newSet = new Set("Set" + this.sets.length, this.grid, newasset);
            this.addSet(newSet);
        }
    }

    
    move(selectedAsset: {asset: Asset, position: {col: number; floor: number; row: number}}, col: number, floor: number, row: number) {
        let allowedPosition = true;
        

        // verify if there a set created
        this.sets.forEach((set) => {
            if (set.hasAssetInPosition(selectedAsset.position.col + col, selectedAsset.position.floor + floor, selectedAsset.position.row + row)) {
                throw new Error("There is already an asset is the position selected");
            }
        });

        if (allowedPosition) {
            console.log("selectedAsset", selectedAsset);
            this.moveAsset(selectedAsset, selectedAsset.position.col + col, selectedAsset.position.floor + floor, selectedAsset.position.row + row);
        }
    }

    moveAsset(asset: {asset: Asset, position: {col: number; floor: number; row: number}}, col: number, floor: number, row: number) {
        console.log("asset", asset);
        console.log("col", col, "floor", floor, "row", row);

        this.sets.forEach((set) => {
            if (!set.hasAssetInPosition(col, floor, row)) {
                set.move(asset, col, floor, row);
            }

            else {
                throw new Error("There is already an asset is the position selected");
            }
        });
    }

    hasAssetInPosition(col: number, floor: number, row: number) {
        for (let i = 0; i < this.sets.length; i++) {
            if (this.sets[i].hasAssetInPosition(col, floor, row)) {
                return true;
            }
        }
        return false;
    }

    public addSet(set: Set) {
        this.sets.push(set);
    }

    // DEBUGGING FUNCTION delete when no needed and create it for the unit tests class.
    public printAssets() {
        //console.log(this.assets);
        const arr = this.sets[0].matrix.matrix;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) { // Check if the row is defined
                for (let j = 0; j < arr[i].length; j++) {
                    for (let k = 0; k < arr[i][j].length; k++) {
                        if (arr[i][j][k]) {
                            console.log(`[${i}][${j}][${k}] = ${arr[i][j][k]!.id}`);
                        }
                    }
                }
            }
        }
    }

    // debug function. Delete when no needed.
    public render(scene: THREE.Scene) {
        // render all the assets in the scene.
        for (let i = 0; i < this.sets.length; i++) {
            const set = this.sets[i];
            console.log(set);
            const arr = set.matrix.matrix;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i]) { // Check if the row is defined
                    for (let j = 0; j < arr[i].length; j++) {
                        for (let k = 0; k < arr[i][j].length; k++) {
                            if (arr[i][j][k] !== null) {
                                // render the asset
                                console.log(`[${i}][${j}][${k}] = ${arr[i][j][k]!.content}`);
                                set.placeAsset(arr[i][j][k]!, i, j, k, this.grid, scene);
                            }
                        }
                    }
                }
            }
        }
    }

    
    getAssetsAsObjects(): THREE.Object3D[] {
        const objects: THREE.Object3D[] = [];
        for (let i = 0; i < this.sets.length; i++) {
            const set = this.sets[i];
            objects.push(...set.getAssets())
        }
        return objects;
    }

    findAssetFromObject(uuid: string) : {asset: Asset, position: {col: number; floor: number; row: number}} | null {
        for (let i = 0; i < this.sets.length; i++) {
            const set = this.sets[i];
            const asset = set.findAsset(uuid);
            if (asset) {
                return {asset: asset.asset, position: {col: asset.position.col, floor: asset.position.floor, row: asset.position.row}};
            }
        }

        return null;
    }

    // the idea is manager all the assets in the scene.
}

export enum Direction {
    FRONT = "front",
    BACK = "back",
    LEFT = "left",
    RIGHT = "right"
}

const directionMap = {
    [Direction.FRONT]: { x: 1, z: 0 },
    [Direction.BACK]: { x: -1, z: 0 },
    [Direction.LEFT]: { x: 0, z: -1 },
    [Direction.RIGHT]: { x: 0, z: 1 },
};

function updateNewPosition(direction: Direction, indx: number, indz: number) {
    if (direction) {
        indx += directionMap[direction].x;
        indz += directionMap[direction].z;
    }
    return { indx, indz };
}

export interface Set {
    name: string;
    matrix: NMatrix<Asset>;
    add(newasset: {
        col: number;
        floor: number;
        row: number;
        grid: EventGrid;
        direction1: Direction;
        direction2?: Direction;
        gap?: number;
    }): void;

    placeAsset(asset: Asset, x: number, y: number, z: number, grid: EventGrid, scene: THREE.Scene): void;

    hasAssetInPosition(x: number, y: number, z: number): boolean;

    getAssets(): THREE.Object3D[];

    findAsset(uuid: string): {asset: Asset, position: {col: number; floor: number; row: number}} | null;
}

export class Set implements Set {
    name: string;
    matrix: NMatrix<Asset>;
    sideMatrix: NMatrix<{loc1: Side; loc2: Side}>; 

    constructor(name: string, grid: EventGrid, initialAsset?: Asset) {
        this.name = name;
        this.matrix = new NMatrix<Asset>(grid.cols, grid.floor, grid.rows, null);
        if (initialAsset) {
            this.matrix.matrix[initialAsset.x][initialAsset.y][initialAsset.z] = initialAsset;
        }
        this.sideMatrix = new NMatrix<{loc1: Side; loc2: Side}>(grid.cols, grid.floor, grid.rows, {loc1: Side.CENTER, loc2: Side.BOTTOM});
    }

    public add(oldasset: {
        col: number;
        floor: number;
        row: number;
        grid: EventGrid;
        direction1: Direction;
        direction2?: Direction;
        gap?: number;
    }) : Asset | null {

        if (this.matrix.matrix[oldasset.col][oldasset.floor][oldasset.row] === null) {
            throw new Error('The asset is not in the grid');
        }
        if (oldasset.direction1 === oldasset.direction2) {
            throw new Error('Direction1 and Direction2 cannot be the same');
        }
        let newasset: Asset;

        newasset = this.matrix.matrix[oldasset.col][oldasset.floor][oldasset.row]!.clone();

        if (oldasset.gap) {
            throw new Error('The gap is not implemented yet');
            // logic for when there is a gap. I will put this to further into the project because it take a little bit more effort, but it would cool to be able to get out of the grid to acommodate the assets based on some custom gap.
        }

        else {
            let indx = newasset.x;
            let indz = newasset.z;



            ({ indx, indz } = updateNewPosition(oldasset.direction1!, indx, indz));
            
            if (oldasset.direction2)
                ({ indx, indz } = updateNewPosition(oldasset.direction2, indx, indz));


            if (indx < 0 || indx >= this.matrix.cols || indz < 0 || indz >= this.matrix.rows) {
                throw new Error('The asset is out of the grid');
            }

            // here we update the x and y according to the new position. This can be improved by restructuring what has the resopnsability to update the position. Because one can forget to update the x and y of the asset.
            newasset.x = indx;
            newasset.z = indz;

            this.matrix.matrix[indx][newasset.y][indz] = newasset;
            this.matrix.matrix[indx][newasset.y][indz]!.x = indx;
            this.matrix.matrix[indx][newasset.y][indz]!.z = indz;

            return this.getAsset(indx, newasset.y, indz);
        }
    }

    move(asset: {asset: Asset, position: {col: number; floor: number; row: number}}, x: number, y: number, z: number) {
        this.matrix.matrix[asset.position.col][asset.position.floor][asset.position.row] = null;
        this.matrix.matrix[x][y][z] = asset.asset;
        
    }

    public getAsset(x: number, y: number, z: number) {
        return this.matrix.matrix[x][y][z];
    }

    public placeAsset(asset: Asset, x: number, y: number, z: number, grid: EventGrid, scene: THREE.Scene) {
        grid.placeAssetTo(asset, x, y, z, this.sideMatrix.matrix[x][y][z]!.loc1, this.sideMatrix.matrix[x][y][z]!.loc2);
        scene.add(asset.content);
    }

    public hasAssetInPosition(row: number, floor: number, col: number): boolean {
        let occupiedByAsset = false;
        this.matrix.forEach((value, _i, _j, _k) => {
            if (value !== null && _i === row && _j === floor && _k === col) {
                console.log('occupied');
                console.log(_i, _j, _k);
                console.log(value);
                occupiedByAsset = true;
            }
        });
        return occupiedByAsset;
    }

    public getAssets(): THREE.Object3D[] {
        const objects: THREE.Object3D[] = [];
        this.matrix.forEach((value, _i, _j, _k) => {
            if (value !== null) {
                objects.push(value.content);
            }
        });
        return objects;
    }


    public findAsset(uuid: string) : {asset: Asset, position: {col: number; floor: number; row: number}} | null {
        let col = -1;
        let floor = -1;
        let row = -1;
        let asset: Asset | null = null;
        this.matrix.forEach((value, _i, _j, _k) => {
            if (value !== null && value.content.uuid === uuid) {
                asset = value;
                col = _i;
                floor = _j;
                row = _k; 
            }
        });
        if (asset === null) {
            return null;
        }
        return {asset: asset, position: {col: col, floor: floor, row: row}};
    }
}

export class ChairSet extends Set {

    constructor(name: string, grid: EventGrid, initialChair?: Chair) {
        if (initialChair) {
            super(name, grid, initialChair);
        }
        else {
            super(name, grid);
        }
    }

    // remove the scene from the parameters. The final rendering should be set in another function. 
    public override placeAsset(asset: Asset, x: number, y: number, z: number, grid: EventGrid, scene: THREE.Scene) {
        grid.placeAssetTo(asset, x, y, z, this.sideMatrix.matrix[x][y][z]!.loc1, this.sideMatrix.matrix[x][y][z]!.loc2);
        scene.add(asset.content);
    }

    public override add(oldasset: {
        col: number;
        floor: number;
        row: number;
        grid: EventGrid;
        direction1: Direction;
        direction2?: Direction;
        gap?: number
    }) : Asset | null {
        // add the logic for the gap.
        const result = super.add(oldasset);
        if (result!.size.width > (oldasset.grid.width / oldasset.grid.cols) || result!.size.depth > (oldasset.grid.depth / oldasset.grid.rows)) {

            if (oldasset.col === 0 && (oldasset.direction1 === Direction.FRONT || oldasset.direction2 === Direction.FRONT)) {
                this.sideMatrix.change({loc1: Side.BOTTOM, loc2: Side.BACK});
            }

            const assetwidth = result!.size.width;
            const assetdepth = result!.size.depth;

            this.matrix.matrix[result!.x][result!.y][result!.z] = null;
            
            const offsetx = Math.floor(assetwidth / (oldasset.grid.width / oldasset.grid.cols));
            const offsetz = Math.floor(assetdepth / (oldasset.grid.depth / oldasset.grid.rows));

            let x = result!.x;
            if (oldasset.direction1 === Direction.FRONT || oldasset.direction2 === Direction.FRONT) {
                x = result!.x + offsetx;
            }

            const z = result!.z + offsetz;
            // here we update the x and y according to the new position. This can be improved by restructuring what has the resopnsability to update the position. Because one can forget to update the x and y of the asset.
            result!.x = x;
            result!.z = z;

            this.matrix.matrix[x][oldasset.floor][z] = result!.clone();

            return result;
        }

        //result!.content.scale.set(0.34, 1, 1);
        return null;
    }
}