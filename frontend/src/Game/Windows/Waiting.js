export default function Waiting(props)
{
    return(
        <div>
            <p className = "code">
                {props.code}
            </p>
            <h3>
                Waiting for other players to join this room
            </h3>
        </div>
    )
}