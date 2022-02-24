import { memo, MutableRefObject, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { Clear, DrawTriangles, setCanvasDimensions, SetColor, Vec2, Vec3 } from "../CanvasRendering"
import { Camera } from "../Camera"
import { RootState } from "../Store"
import { GameState } from "../Store/Game"

export type Actions = {
    updateVertices?: (vertices: Vec2[] | Vec2[][]) => void
    forceRender?: () => void
}

type CanvasProps = {
    camera: Camera,
    actions: Actions,
    onResize: (size: Vec2) => void
}

export default memo((props: CanvasProps) => {
    const canvas = useRef<HTMLCanvasElement>(null)
    const context = useRef<CanvasRenderingContext2D>();
    const vertices = useRef<Vec2[] | Vec2[][]>([])
    const gameState = useSelector<RootState>(state => state.game) as GameState

    //console.log("Canvas update: ", props)

    props.actions.updateVertices = (vert: Vec2[] | Vec2[][]) => {
        vertices.current = vert
        Draw();
    }

    props.actions.forceRender = Draw

    useEffect(() => {
        if (canvas.current) {
            context.current = canvas.current.getContext("2d") || undefined

            canvas.current.width = parseInt(getComputedStyle(canvas.current).width)
            canvas.current.height = parseInt(getComputedStyle(canvas.current).height)

            UpdateCanvasSize();
            canvas.current.addEventListener("resize", UpdateCanvasSize)
        }

        Draw()

        return () => {
            canvas.current && canvas.current.removeEventListener("resize", UpdateCanvasSize)
        }
    }, [])

    useEffect(() => {

    }, [props.actions])

    useEffect(() => {
        Draw()
    }, [props.camera])

    function UpdateCanvasSize() {
        if (canvas.current) {
            let { width, height }: { width: string | number, height: string | number } = getComputedStyle(canvas.current)
            width = parseInt(width)
            height = parseInt(height)
            setCanvasDimensions(width, height);
            Draw();

            props.onResize(new Vec2(width, height))
        }

    }

    function Draw() {
        if (!context.current || !canvas.current || vertices.current.length === 0) {
            return
        }

        SetColor(context.current, "#000000");
        Clear(context.current);

        function _DrawItem(item: Vec2[]) {
            if (!context.current) {
                return
            }

            let transformed = []

            for (let v of item) {
                const vertex = new Vec3(v.x, v.y, 1.0).multiply(props.camera.view);
                transformed.push(vertex);
            }

            DrawTriangles(context.current, transformed, "#ffff00");
        }


        if (vertices.current[0] instanceof Array) {
            for (let item of vertices.current) {
                _DrawItem(item as Vec2[])
            }
        }
        else {
            _DrawItem(vertices.current as Vec2[])
        }
    }

    return (
        <canvas ref={canvas} style={{ visibility: gameState.hasStarted ? "visible" : "hidden" }} />
    )
}, (prev, next) => true)