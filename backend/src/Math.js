
class matrix2x2 {
    constructor(x, y) {
        if (!(x instanceof vec2) || x instanceof Number) {
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


module.exports = { vec2, matrix2x2 }