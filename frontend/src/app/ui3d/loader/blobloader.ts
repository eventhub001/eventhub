import * as zim from "zimjs";
import { AssetModel } from "../../interfaces";

export async function blobToImage(blob: Blob): Promise<zim.Bitmap> {
    return new Promise((resolve, reject) => {
        // Create an Object URL for the image Blob
        const imageUrl = URL.createObjectURL(blob);

        // Use Bitmap.fromData to load the image
        zim.Bitmap.fromData(imageUrl, (bitmap: zim.Bitmap) => {
            // Clean up the URL after the bitmap is loaded
            URL.revokeObjectURL(imageUrl);

            // Center the bitmap if needed
            // Resolve the promise with the created bitmap
            resolve(bitmap);
        });
    });
}

export function blobsToImages(blobs: Blob[]): Promise<zim.Bitmap[]> {
    return Promise.all(blobs.map(blob => blobToImage(blob)));
}

export function loadModelImages(blobs: Blob[]) : Promise<zim.Bitmap[]> {
    return Promise.all(blobs.map((model) => {
        return blobToImage(model);
    }));
}