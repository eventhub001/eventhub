enum Dimension {
    WIDTH = 0,
    HEIGHT = 1,
    DEPTH = 2
}

export type settings = {
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number
}

export class SetUpUI {
    public static setUpUI(
        UIWidthMax: number,
        UIHeightMax: number,
        eventWidth: number,
        eventHeight: number,
        depth: number,
        sizex: number,
        sizez: number,
        sizey: number) : settings {
        let width = 0;
        let height = 0;
        const superiorDimension: Dimension = eventWidth > eventHeight ? Dimension.WIDTH : Dimension.HEIGHT; 
        if (superiorDimension === Dimension.WIDTH) {
            width = UIWidthMax;
            height = UIWidthMax * (eventHeight / eventWidth);
        }

        if (superiorDimension === Dimension.HEIGHT) {
            height = UIHeightMax;
            width = UIHeightMax * (eventWidth / eventHeight);
        }

        const percX = sizex / width;
        const percY = sizez / height;

        return {
            width: width,
            height: height,
            depth: depth,
            x: sizex,
            y: sizez
        }
    }
}