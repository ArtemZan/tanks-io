import { Vec2 } from "./CanvasRendering";

class GameObject
{
    id: string;
    vert: Vec2[] = []

    constructor(id: string)
    {
        this.id = id
    }

    update()
    {

    }
}

class Scene {
    objects: GameObject[] = []

    timer?: Date

    update()
    {
        const dTime = this._updateTimer();

        this.objects.forEach(obj => obj.update())
    }

    getVertices(): Vec2[][]
    {
        return this.objects.map(obj => obj.vert)
    }

    _updateTimer(): number
    {
        const date = new Date()
        let dTime = 0;

        if(this.timer)
        {
            dTime = date.getMilliseconds() - this.timer.getMilliseconds()
        }

        this.timer = date

        return dTime;
    }
}

const scene = new Scene()

export default scene