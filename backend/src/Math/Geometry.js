const {vec2, vec3, matrix2x2, matrix3x3} = require("./LinearAlgebra");

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

//Returns false or two lines that collided, each represented by array of two indices of points in corresponding given mesh
function DetectCollision(mesh1, mesh2)
{
    if(!Array.isArray(mesh1))
    {
        console.error("'mesh1' given to 'DetectCollision' must be an array, but got ", mesh1);
        return;
    }
    
    if(!Array.isArray(mesh2))
    {
        console.error("'mesh2' given to 'DetectCollision' must be an array, but got ", mesh2);
        return;
    }
    
    mesh1 = mesh1.map(vec => new vec2(vec.x, vec.y));
    mesh2 = mesh2.map(vec => new vec2(vec.x, vec.y));

    for(let i1 = 0; i1 < mesh1.length - 2; i1 += 3)
    {
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
    Area, IsPointInside, IsPointAbove, DoLinesIntersect, DoTrianglesIntersect, DetectCollision
}