
class matrix2x2 {
    constructor(x, y) {
        if (typeof x === "number") {
            this.x = new vec2(x, 0);
            this.y = new vec2(0, x);
        }
        else {
            this.x = x;
            this.y = y;
        }
    }
}

class matrix3x3 {
    constructor(x, y, z) {
        if (typeof x === "number") {
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
        return this.mult(
            new matrix2x2(
                new vec2(Math.cos(rad), Math.sin(rad)),
                new vec2(-Math.sin(rad), Math.cos(rad))
            )
        );
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

    cross(vec)
    {
        return new vec3(this.x, this.y, 0).cross(new vec3(vec.x, vec.y, 0));
    }

    // sin(vec)
    // {
    //     return new vec3(this.x, this.y, 0).sin(new vec3(vec.x, vec.y, 0));
    // }
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

    dot(vec)
    {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }

    cos(vec)
    {
        return this.normalize.dot(vec.normalize());
    }

    cross(vec)
    {
        return new vec3(
            this.y * vec.z - this.z * vec.y,
            this.z * vec.x - this.x * vec.z,
            this.x * vec.y - this.y * vec.x
        )
    }

    // sin(vec)
    // {
    //     return this.normalize().cross(vec.normalize());
    // }
}

//Returns area of the triangle
function Area(p1, p2, p3)
{
    if(p1 instanceof vec2 && p2 instanceof vec2 && p3 instanceof vec2)
    {
        let a = p2.sub(p3).magnitude();
        let b = p1.sub(p3).magnitude();
        let c = p1.sub(p2).magnitude();

        return Math.sqrt(Math.sqrt((a + b + c) * (a + b - c) * (a - b + c) * (-a + b + c)) / 4);
    }

    console.log("Invalid data");
    return NaN;
}

//Accepts a point and a tringle and returns whether the point is inside the triangle
function IsPointInside(p, tr)
{
    if(Area(p, tr[0], tr[1]) + Area(p, tr[1], tr[2]) + Area(p, tr[2], tr[0]) - 0.000001 <= Area(...tr))
    {
        return true;
    }

    return false;
}

//Every parameter must be of type vec2
function IsPointAbove(point, line_start, line_end)
{
    //Express the line as linear equation f(x) = ax + b

    let a = line_end.sub(line_start);
    a = a.y / a.x;
    
    let b = line_start.y;

    return (point.x - line_start.x) * a + b < point.y;
}

//Accepts two arrays as arguments, each consisting of two vertices of type vec2
function DoLinesIntersect(l1, l2)
{
    if(!(l1[0] instanceof vec2 
        && l1[1] instanceof vec2 
        && l2[0] instanceof vec2 
        && l2[1] instanceof vec2))
        {
            console.log("Invalid data in 'DoLinesIntersect'. Given: ", ...arguments);
        }
    return (IsPointAbove(l1[0], l2[0], l2[1]) !== IsPointAbove(l1[1], l2[0], l2[1])) 
    && (IsPointAbove(l2[0], l1[0], l1[1]) !== IsPointAbove(l2[1], l1[0], l1[1]))
}

//Accepts two arrays as arguments, each consisting of three vertices of type vec2
function DoTrianglesIntersect(tr1, tr2)
{
    for(let l1i = 0; l1i < tr1.length; l1i++)
    {
        let l1 = [tr1[l1i === 0 ? 2 : l1i - 1], tr1[l1i]];

        for(let l2i = 0; l2i < tr2.length; l2i++)
        {
            let l2 = [tr2[l2i === 0 ? 2 : l2i - 1], tr2[l2i]];

            if(DoLinesIntersect(l1, l2))
            {
                return {
                    line1: [l1i === 0 ? 2 : l1i - 1, l1i],
                    line2: [l2i === 0 ? 2 : l2i - 1, l2i],
                };
            }
        }
    }

    return false;
}

function DetectCollision(mesh1, mesh2)
{
    mesh1 = mesh1.map(vec => new vec2(vec.x, vec.y));
    mesh2 = mesh2.map(vec => new vec2(vec.x, vec.y));

    for(let i1 = 0; i1 < mesh1.length - 2; i1 += 3)
    {
        if(!(mesh1[i1] instanceof vec2))
        {
            console.log("Expected vec2, but got", mesh1[i1]);
        }

        for(let i2 = 0; i2 < mesh2.length - 2; i2 += 3)
        {
            let intersection = DoTrianglesIntersect(
                [mesh1[i1], mesh1[i1 + 1], mesh1[i1 + 2]],
                [mesh2[i2], mesh2[i2 + 1], mesh2[i2 + 2]]);

            if(intersection)
                {
                    return {
                        line1: [
                            intersection.line1[0] + i1,
                            intersection.line1[1] + i1
                        ],
                        line2: [
                            intersection.line2[0] + i2,
                            intersection.line2[1] + i2
                        ]
                    };
                }
        }
    }

    return false;
}


module.exports = { 
    vec2, matrix2x2,
    DetectCollision }