export default function LoseWindow(props)
{
    return(
        <div className = "start-window">
            <h3 className="message message-main">You has been killed by ...</h3>
            <h4 className="message message-secondary">Your final score: {props.score}</h4>
        </div>
    )
}