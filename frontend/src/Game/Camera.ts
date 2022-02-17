import { Matrix2x3, Vec2 } from "./CanvasRendering";
import { Player } from "./Player";

export class Camera2D {
    view: Matrix2x3 = new Matrix2x3(new Vec2(), new Vec2(), new Vec2());
}

export class Camera extends Camera2D 
{
    // Difference between the camera position and the player position on the screen
    offset: Vec2 = new Vec2();

    Update(player: Player, aspect_ratio: number)
    {
        const scale = 0.05;

        this.view.i.x = scale / aspect_ratio;
        this.view.j.y = scale;

        let offset = player.dir.scale(scale).sub(this.offset);
        offset = new Vec2(0, 0);

        //console.log(this.playerDir);

        const cam_movement_speed = 0.0003;

        if (offset.x > cam_movement_speed)
            this.offset.x += cam_movement_speed;
        else if (offset.x < -cam_movement_speed)
            this.offset.x -= cam_movement_speed;
        else
            this.offset.x += offset.x;

        if (offset.y > cam_movement_speed)
            this.offset.y += cam_movement_speed;
        else if (offset.y < -cam_movement_speed)
            this.offset.y -= cam_movement_speed;
        else
            this.offset.y += offset.y;


        this.offset = new Vec2()

        this.view.k = new Vec2(
            -player.pos.x * scale / aspect_ratio - this.offset.x,
            -player.pos.y * scale - this.offset.y
        );
    }
}
