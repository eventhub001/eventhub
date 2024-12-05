import { Asset } from "../../../interfaces";
import { NMatrix } from "./matrices";
import { EventGrid } from "./grid";
import { Side } from "./3dtypes";
import { DefaultThreeDObject } from "../models/default.model";
import * as THREE from 'three';


export enum Direction {
    FRONT = "front",
    BACK = "back",
    LEFT = "left",
    RIGHT = "right"
}
export class Set implements Set {
    name: string;
    assets: Asset[] = [];
    matrix: NMatrix<Asset>;
    sideMatrix: NMatrix<{loc1: Side; loc2: Side}> | undefined; 
    grid: EventGrid;

    constructor(name: string, grid: EventGrid, initialAsset?: Asset) {
        this.name = name;
        this.grid = grid;
        this.matrix = new NMatrix<Asset>(grid.cols, grid.floor, grid.rows, null);
        if (initialAsset) {
            this.matrix.matrix[initialAsset.col][initialAsset.floor][initialAsset.row] = initialAsset;
            this.sideMatrix = new NMatrix<{loc1: Side; loc2: Side}>(grid.cols, grid.floor, grid.rows, {loc1: Side.CENTER, loc2: Side.BOTTOM});
            this.placeAsset(initialAsset, initialAsset.col, initialAsset.floor, initialAsset.row);
            this.assets.push(initialAsset);
        }
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

            this.placeAsset(newasset, indx, newasset.y, indz);

            this.assets.push(newasset);

            return this.getAsset(indx, newasset.y, indz);
        }
    }

    delete(selectedAsset: {asset: Asset, position: {col: number; floor: number; row: number}}) {
        this.matrix.matrix[selectedAsset.position.col][selectedAsset.position.floor][selectedAsset.position.row] = null;
    }

    deleteAll() {
        this.matrix = new NMatrix<Asset>(this.grid.cols, this.grid.floor, this.grid.rows, null);
    }

    move(asset: {asset: Asset, position: {col: number; floor: number; row: number}}, col: number, floor: number, row: number) {
        console.log("removing: ", asset.position.col, asset.position.floor, asset.position.row);
        this.matrix.matrix[asset.position.col][asset.position.floor][asset.position.row] = null;
        this.matrix.matrix[col][floor][row] = asset.asset;
        this.placeAsset(asset.asset, col, floor, row);
        
    }

    public getAsset(x: number, y: number, z: number) {
        return this.matrix.matrix[x][y][z];
    }

    public placeAsset(asset: Asset, x: number, y: number, z: number) {
        if (x >= this.matrix.cols || z >= this.matrix.rows) {
            console.log(asset)
            console.error(x, y, z);
            console.log("with matrix of dims: ", this.matrix.cols, this.matrix.rows);
            throw new Error('The asset is out of the grid');
        }
        this.grid.placeAssetTo(asset, x, y, z, this.sideMatrix!.matrix[x][y][z]!.loc1, this.sideMatrix!.matrix[x][y][z]!.loc2);
    }

    public render(asset: Asset, scene: THREE.Scene) {
        scene.add(asset.content);
    }

    public hasAssetInPosition(row: number, floor: number, col: number): boolean {
        let occupiedByAsset = false;
        this.matrix.forEach((value, _i, _j, _k) => {
            if (value !== null && _i === row && _j === floor && _k === col) {
                console.error('occupied by asset in position');
                console.error(_i, _j, _k);
                console.error("asset: ", value);
                occupiedByAsset = true;
            }
        });
        return occupiedByAsset;
    }

    public getAssets(): Asset[] {
        const objects: Asset[] = [];
        this.matrix.forEach((value, _i, _j, _k) => {
            if (value !== null) {
                objects.push(value);
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


export class ChairSet extends Set {

    constructor(name: string, grid: EventGrid, initialChair?: DefaultThreeDObject) {
        if (initialChair) {
            super(name, grid, initialChair);
        }
        else {
            super(name, grid);
        }
    }

    public override placeAsset(asset: Asset, x: number, y: number, z: number) {
        this.grid.placeAssetTo(asset, x, y, z, this.sideMatrix!.matrix[x][y][z]!.loc1, this.sideMatrix!.matrix[x][y][z]!.loc2);
    }

    public override render(asset: Asset, scene: THREE.Scene) {
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
                this.sideMatrix!.change({loc1: Side.BOTTOM, loc2: Side.BACK});
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

        return null;
    }
}