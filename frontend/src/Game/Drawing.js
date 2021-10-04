function Init(canvasElement) {
    canvas = canvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context = canvas.getContext("2d");

}


var canvas;
var context;

/* Settings */
var WIREFRAME_MODE = false;
var DEFAULT_FONT_SIZE = 16;
var DEFAULT_FONT_FAMILY = 'serif';
/* --- */



class matrix2x2 {
    constructor(i, j) {
        this.x = i;
        this.y = j;
    }
}

class matrix3x3 {
    constructor(x, y, z) {
        if (!(x instanceof vec3) || x instanceof Number) {
            this.x = new vec3(x, 0, 0);
            this.y = new vec3(0, x, 0);
            this.z = new vec3(0, 0, x);
        }
        else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }
}

class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    mult(matrix) {
        if (matrix instanceof matrix2x2) {
            return matrix.x.scale(this.x).add(matrix.y.scale(this.y));
        }
    }

    rotate(rad) {
        return this.mult(new matrix2x2(Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)));
    }

    normalize() {
        let l = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        return new vec2(this.x / l, this.y / l);
    }

    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    sub(vec) {
        return new vec2(this.x - vec.x, this.y - vec.y);
    }

    add(vec) {
        return new vec2(this.x + vec.x, this.y + vec.y);
    }

    scale(k) {
        return new vec2(this.x * k, this.y * k);
    }
}

class vec3 {
    constructor(x, y, z) {
        if (y === undefined) {
            this.x = x;
            this.y = x;
            this.z = x;
        }
        else {
            this.x = x;
            this.y = y;
            this.z = z;
        }

    }

    mult(matrix) {
        if (matrix instanceof matrix3x3) {
            return matrix.x.scale(this.x).add(matrix.y.scale(this.y)).add(matrix.z.scale(this.z));
        }
    }

    //to do
    rotate(axis, rad) {

        //return this.multiply(new matrix3x3(Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)));
    }

    normalize() {
        let l = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        return this.scale(1 / l);
    }

    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }

    sub(vec) {
        return new vec3(this.x - vec.x, this.y - vec.y, this.z - vec.z);
    }

    add(vec) {
        return new vec3(this.x + vec.x, this.y + vec.y, this.z + vec.z);
    }

    scale(k) {
        return new vec3(this.x * k, this.y * k, this.z * k);
    }
}

class Camera2D {
    constructor(view) {
        if (view instanceof matrix3x3) {
            this.view = view;
        }
        else {
            this.view = new matrix3x3(1);
        }
    }
}

/* General utilities */
const ClearFloat = x => Math.round(x * 1e9) / 1e9

const MinWindowDimension = () => (window.innerWidth < window.innerHeight) ? window.innerWidth : window.innerHeight;
const MaxWindowDimension = () => (window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight;

const ToWindowSpace = vec => new vec2((vec.x + 1) / 2 * window.innerWidth, (1 - vec.y) / 2 * window.innerHeight);
const ToWorldSpace = vec => new vec2(vec.x / window.innerWidth * 2 - 1, 1 - vec.y / window.innerHeight * 2);
/* --- */

/* Rendering utilities */
function Clear(color) {
    SetColor(color)
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function SetColor(color) {
    if (color !== undefined) {
        context.strokeStyle = color;
        context.fillStyle = color;
    }
}

function DrawText(text, pos, options) {

    let maxWidth = undefined;

    context.font = DEFAULT_FONT_SIZE.toString().concat("px ").concat(DEFAULT_FONT_FAMILY);

    if (options instanceof Object) {
        let font = "";

        function add(data) {
            if (font.length)
                font = font.concat(' ');

            font = font.concat(data);

        }

        if (options.fontSize) {
            add(parseInt(options.fontSize).toString().concat("px"));
        }

        if (options.fontFamily) {
            add(options.fontFamily);
        }

        context.font = font;

        SetColor(options.color);

        if (options.maxWidth) {
            maxWidth = options.maxWidth
        }
    }

    pos = ToWindowSpace(pos);

    if (WIREFRAME_MODE)
        context.strokeText(text, pos.x, pos.y, 1000)
    else
        context.fillText(text, pos.x, pos.y, maxWidth)
}

function DrawLine(start, end, color) {
    SetColor(color);
    start = ToWindowSpace(start);
    end = ToWindowSpace(end);

    context.beginPath();
    context.lineWidth = 1;
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
}

function DrawDot(pos, size, color) {
    SetColor(color);

    pos = ToWindowSpace(pos);

    context.beginPath();
    context.arc(pos.x, pos.y, size, 0, 2 * Math.PI)
    context.fill();
}

function DrawTriangle(vert1, vert2, vert3, color) {

    SetColor(color);

    vert1 = ToWindowSpace(vert1);
    vert2 = ToWindowSpace(vert2);
    vert3 = ToWindowSpace(vert3);

    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(vert1.x, vert1.y);
    context.lineTo(vert2.x, vert2.y);
    context.lineTo(vert3.x, vert3.y);
    if (WIREFRAME_MODE)
        context.stroke();
    else
        context.fill();
    context.closePath();
}
/* --- */

/* Meshes and groups renderers */
function DrawTriangles(vertices, color) {
    if (color === undefined) {
        color = "#000000";
    }

    for (let v = 2; v < vertices.length; v += 3) {
        DrawTriangle(vertices[v - 2], vertices[v - 1], vertices[v], color);
    }
}

function DrawLines(vertices, color) {
    for (let v = 1; v < vertices.length; v += 2) {
        DrawLine(vertices[v - 1], vertices[v], color);
    }
}

function DrawCurve(vertices, color) {
    for (let v = 1; v < vertices.length; v++) {
        DrawLine(vertices[v - 1], vertices[v], color);
    }
}

function DrawBezierCurve(points, curveSubdivision, color) {
    let helpers = [];
    //let point = points[0];

    for (let i = 0; i < points.length - 1; i++) {
        helpers.push(points.slice(0, i ? -i : undefined));
    }

    //console.log(helpers);

    // for (let i = 0; i < points.length - 2; i++) {
    //     helpers.push([]);
    //     let group = helpers[helpers.length - 1];
    //     for (let h = 0; h < points.length - i - 1; h++) {
    //         group.push(new vec2)
    //     }
    // }

    SetColor(color);

    context.beginPath();
    let startP = ToWindowSpace(points[0]);
    context.moveTo(startP.x, startP.y);

    for (let v = 0; v < curveSubdivision; v++) {

        for (let h = 1; h < helpers.length; h++) {
            for (let hp = 0; hp < helpers[h].length; hp++) {
                helpers[h][hp] = helpers[h - 1][hp];

                let dif = helpers[h - 1][hp + 1].sub(helpers[h - 1][hp]);
                let dPos = dif.scale(v / curveSubdivision);
                helpers[h][hp] = helpers[h][hp].add(dPos);

                //DrawLine(...helpers[helpers.length - 1], "#ffffff");
                //DrawDot(helpers[helpers.length - 1][0], 2);
                //console.log(...helpers[helpers.length - 1]);

                //h === helpers.length - 1 && console.log(dif);
            }
        }

        let dif = helpers[helpers.length - 1][1].sub(helpers[helpers.length - 1][0]);
        let hPos = helpers[helpers.length - 1][0];
        //let sPos = hPos.add(dif.scale((v - 4) / curveSubdivision)); 
        let nPos = ToWindowSpace(hPos.add(dif.scale(v / curveSubdivision)));
        //console.log(helpers[helpers.length - 1]);

        context.lineTo(nPos.x, nPos.y);
    }

    context.stroke();
    //context.closePath();

    //DrawLine(...helpers[helpers.length - 1], "#ffffff");
    //DrawDot(point, 10);
}

function DrawTexts(texts) {
    for (let text of texts) {
        DrawText(...text);
    }
}
/* --- */

function RunLoop(OnUpdate, OnStop) {

    if (OnUpdate()) {
        //setTimeout(RunLoop.bind(null, OnUpdate, undefined), 30);
        requestAnimationFrame(RunLoop.bind(null, OnUpdate, undefined));
    }
    else {
        if (OnStop)
            OnStop();
    }
}


export {
    vec2, vec3, matrix2x2, matrix3x3,
    Camera2D,
    Init, RunLoop,
    Clear,
    SetColor,
    DrawLine, DrawTriangle, DrawDot, DrawText,
    DrawLines, DrawCurve, DrawBezierCurve, DrawTriangles, DrawTexts
}