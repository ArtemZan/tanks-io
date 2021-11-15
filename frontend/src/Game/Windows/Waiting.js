import { useContext, useEffect, useState } from "react";
import { EmailShareButton, FacebookShareButton, FacebookMessengerShareButton, FacebookMessengerIcon } from "react-share"
import { gameStateContext } from "../State"
import { Tooltip } from "../../Components/Components"

function CopyButton({ roomCode }) {
    const [animation, SetAnimation] = useState("");
    const [shouldAnimate, ShouldAnimate] = useState(false);

    useEffect(() => {
        if (shouldAnimate) {
            ShouldAnimate(false);
            SetAnimation(" fading");
        }
    })

    function Copy() {
        navigator.clipboard.writeText(roomCode);

        ShouldAnimate(true);
        SetAnimation("");
    }

    console.log(shouldAnimate, animation);

    return <button onClick={Copy} className="tooltip-container">
        <i className="material-icons hoverable">content_copy</i>

        <Tooltip className={animation} style={{ animation }} position="bottom">Copied</Tooltip>
    </button>
}

export default function Waiting() {
    const { state } = useContext(gameStateContext);
    const code = state.roomCode;
    const url = window.location.pathname + `?room_code=${code}`;

    return (
        <div className="waiting-ui">
            <div className="code">
                Room code: <strong>{code}</strong>

                <div className="share">
                    <CopyButton roomCode={code} />

                    <FacebookShareButton appId="02948091028095" url={url}>
                        <FacebookMessengerIcon />
                    </FacebookShareButton>
                </div>
            </div>
            <h3>
                Waiting for other players to join this room
            </h3>
        </div >
    )
}