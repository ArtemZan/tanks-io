
const WIREFRAME_MODE = false;
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_FAMILY = 'serif';

let canvasWidth: number = 100;
let canvasHeight: number = 100;

function setCanvasDimensions(width: number, height: number) {
    canvasWidth = width;
    canvasHeight = height;
}

class Matrix2 {
    i: Vec2
    j: Vec2

    constructor(i: Vec2, j: Vec2) {
        this.i = i
        this.j = j
    }
}

class Matrix3 {
    i: Vec3
    j: Vec3
    k: Vec3

    constructor(i: Vec3, j: Vec3, k: Vec3) {
        this.i = i
        this.j = j
        this.k = k
    }
}

class Matrix2x3 {
    i: Vec2
    j: Vec2
    k: Vec2

    constructor(i: Vec2, j: Vec2, k: Vec2) {
        this.i = i
        this.j = j
        this.k = k
    }

    static clone(src: Matrix2x3): Matrix2x3
    {
        return new Matrix2x3(Vec2.clone(src.i), Vec2.clone(src.j), Vec2.clone(src.k));
    }
}

class Vec2 {
    x: number
    y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    static clone(src: Vec2): Vec2
    {
        return new Vec2(src.x, src.y)
    }

    multiply(matrix: Matrix2): Vec2 {
        return matrix.i.scale(this.x).add(matrix.j.scale(this.y))
    }

    rotate(rad: number): Vec2 {
        return this.multiply(new Matrix2(new Vec2(Math.cos(rad), -Math.sin(rad)), new Vec2(Math.sin(rad), Math.cos(rad))))
    }

    normalize(): Vec2 {
        return this.scale(1 / this.magnitude())
    }

    magnitude(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2)
    }

    sub(vec: Vec2): Vec2 {
        return new Vec2(this.x - vec.x, this.y - vec.y)
    }

    add(vec: Vec2): Vec2 {
        return new Vec2(this.x + vec.x, this.y + vec.y)
    }

    scale(k: number): Vec2 {
        return new Vec2(this.x * k, this.y * k)
    }
}


class Vec3 {
    x: number
    y: number
    z: number

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x
        this.y = y
        this.z = z
    }

    multiply(matrix: Matrix2x3): Vec2;
    multiply(matrix: Matrix3): Vec3;
    multiply(matrix: Matrix3 | Matrix2x3): Vec2 | Vec3 {
        //const mat = matrix as any

        if("z" in matrix.i)
        {
            matrix = matrix as Matrix3
            return matrix.i.scale(this.x).add(matrix.j.scale(this.y)).add(matrix.k.scale(this.z));
        }

        matrix = matrix as Matrix2x3
        return matrix.i.scale(this.x).add(matrix.j.scale(this.y)).add(matrix.k.scale(this.z));
        
    }

    // rotate(rad: number): Vec3 {
    //     return this.multiply(new Matrix2(new Vec2(Math.cos(rad), -Math.sin(rad)), new Vec2(Math.sin(rad), Math.cos(rad))));
    // }

    normalize(): Vec3 {
        return this.scale(1 / this.magnitude());
    }

    magnitude(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    sub(vec: Vec3): Vec3 {
        return new Vec3(this.x - vec.x, this.y - vec.y, this.z - vec.z);
    }

    add(vec: Vec3): Vec3 {
        return new Vec3(this.x + vec.x, this.y + vec.y, this.z + vec.z);
    }

    scale(k: number): Vec3 {
        return new Vec3(this.x * k, this.y * k, this.z * k);
    }
}


/* General utilities */
//const MinWindowDimension = () => (canvasWidth < canvasHeight) ? canvasWidth : canvasHeight;
//const MaxWindowDimension = () => (canvasWidth > canvasHeight) ? canvasWidth : canvasHeight;

const ToWindowSpace = ({ x, y }: Vec2) => new Vec2((x + 1) / 2 * canvasWidth, (1 - y) / 2 * canvasHeight);
const ToWorldSpace = ({ x, y }: Vec2) => new Vec2(x / canvasWidth * 2 - 1, 1 - y / canvasHeight * 2);
/* --- */

/* Rendering utilities */

type Color = string | CanvasGradient | CanvasPattern

function SetColor(context: CanvasRenderingContext2D, color: Color) {
    context.strokeStyle = color;
    context.fillStyle = color;
}

type TextOptions = { fontSize: number, fontFamily: string, color: Color, maxWidth: number }

function DrawText(context: CanvasRenderingContext2D, text: string, pos: Vec2, options?: TextOptions) {

    let maxWidth = undefined;

    let font = "";

    function add(data: string) {
        if (font.length)
            font += ' ';

        font += data;
    }

    if (options) {
        if (options.fontSize) {
            add(options.fontSize.toString() + ("px"));
        }
        else {
            add(DEFAULT_FONT_SIZE.toString() + "px")
        }

        add(options.fontFamily || DEFAULT_FONT_FAMILY);

        context.font = font;

        options.color && SetColor(context, options.color);

        options.maxWidth && (maxWidth = options.maxWidth)
    }

    pos = ToWindowSpace(pos);

    if (WIREFRAME_MODE)
        context.strokeText(text, pos.x, pos.y, 1000)
    else
        context.fillText(text, pos.x, pos.y, maxWidth)
}

function DrawLine(context: CanvasRenderingContext2D, start: Vec2, end: Vec2, color?: Color, width: number = 1) {
    color && SetColor(context, color);
    start = ToWindowSpace(start);
    end = ToWindowSpace(end);

    //console.log(start, end);

    context.beginPath();
    context.lineWidth = width;
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
}

function DrawDot(context: CanvasRenderingContext2D, pos: Vec2, size: number = 1, color?: Color) {
    color && SetColor(context, color);

    pos = ToWindowSpace(pos);

    context.beginPath();
    context.arc(pos.x, pos.y, size, 0, 2 * Math.PI)
    context.fill();
}

function DrawTriangle(context: CanvasRenderingContext2D, vert1: Vec2, vert2: Vec2, vert3: Vec2, color?: Color) {
    color && SetColor(context, color);

    vert1 = ToWindowSpace(vert1);
    vert2 = ToWindowSpace(vert2);
    vert3 = ToWindowSpace(vert3);

    

    //console.log(vert1, vert2, vert3);

    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(vert1.x, vert1.y);
    context.lineTo(vert2.x, vert2.y);
    context.lineTo(vert3.x, vert3.y);
    if (WIREFRAME_MODE)
        context.stroke();
    else
        context.fill();
    context.closePath();
}

function Clear(context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, canvasWidth, canvasHeight)
}
/* --- */

/* Meshes and groups renderers */
function DrawTriangles(context: CanvasRenderingContext2D, vertices: Vec2[], color?: Color) {
    for (let v = 2; v < vertices.length; v += 3) {
        DrawTriangle(context, vertices[v - 2], vertices[v - 1], vertices[v], color);
    }
}

function DrawLines(context: CanvasRenderingContext2D, vertices: Vec2[], color?: Color) {
    for (let v = 1; v < vertices.length; v += 2) {
        DrawLine(context, vertices[v - 1], vertices[v], color);
    }
}

function DrawCurve(context: CanvasRenderingContext2D, vertices: Vec2[], color?: Color | ((index: number, point: Vec2) => Color), width?: number) {
    for (let v = 1; v < vertices.length; v++) {
        let currentColor: Color | undefined;
        if (typeof color === "function") {
            currentColor = color(v - 1, vertices[v - 1].add(vertices[v]).scale(0.5))
        }
        else {
            currentColor = color
        }

        DrawLine(context, vertices[v - 1], vertices[v], currentColor, width);
    }
}

function DrawBezierCurve(context: CanvasRenderingContext2D, points: Vec2[], curveSubdivision: number, color?: Color | ((index: number, point: Vec2) => Color), width?: number) {
    let helpers: Vec2[][] = [];
    let res: Vec2[] = []

    for (let i = 0; i < points.length - 1; i++) {
        helpers.push(points.slice(0, i ? -i : undefined));
    }

    let startP = points[0];
    res.push(startP)

    for (let v = 1; v < curveSubdivision + 1; v++) {

        for (let h = 1; h < helpers.length; h++) {
            for (let hp = 0; hp < helpers[h].length; hp++) {
                helpers[h][hp] = helpers[h - 1][hp];

                let dif = helpers[h - 1][hp + 1].sub(helpers[h - 1][hp]);
                let dPos = dif.scale(v / curveSubdivision);
                helpers[h][hp] = helpers[h][hp].add(dPos);
            }
        }

        let dif = helpers[helpers.length - 1][1].sub(helpers[helpers.length - 1][0]);
        let hPos = helpers[helpers.length - 1][0];
        let nPos = hPos.add(dif.scale(v / curveSubdivision));

        res.push(nPos);
    }

    DrawCurve(context, res, color, width);
}

function DrawTexts(context: CanvasRenderingContext2D, texts: [{ text: string, pos: Vec2, options?: TextOptions }]) {
    for (let { text, pos, options } of texts) {
        DrawText(context, text, pos, options);
    }
}
/* --- */


export {
    Vec2, Vec3, Matrix2, Matrix3, Matrix2x3,
    SetColor,
    DrawLine, DrawTriangle, DrawDot, DrawText,
    DrawLines, DrawCurve, DrawBezierCurve, DrawTriangles, DrawTexts,
    ToWorldSpace, ToWindowSpace,
    setCanvasDimensions,
    Clear
}