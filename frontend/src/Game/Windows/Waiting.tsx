import { useContext, useEffect, useState } from "react";
import { FacebookShareButton, FacebookMessengerIcon, TelegramShareButton, TelegramIcon, ViberShareButton, ViberIcon, TwitterShareButton, TwitterIcon } from "react-share"
import { Tooltip, Link } from "../../Utilities/Components"
import { SetParam } from "../../Utilities/URL";
import { useSelector } from "react-redux";
import { RootState } from "../Store";

function CopyButton({ roomCode }: { roomCode: string }) {
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

    return <button onClick={Copy} className="copy tooltip-container">
        <i className="material-icons hoverable">content_copy</i>

        <Tooltip className={animation} position="top">Copied</Tooltip>
    </button>
}

function ShareCode({ code }: { code: string }) {
    const url = SetParam(window.location.toString(), "room_code", code);
    const title = "Tanks.io";

    const buttonProps = { title, url }
    const iconsProps = { size: 50, round: true };


    return <div className="share">
        <CopyButton roomCode={code} />

        <FacebookShareButton {...buttonProps}>
            <FacebookMessengerIcon {...iconsProps} />
        </FacebookShareButton>

        <TelegramShareButton {...buttonProps}>
            <TelegramIcon {...iconsProps} />
        </TelegramShareButton>

        <ViberShareButton {...buttonProps}>
            <ViberIcon {...iconsProps} />
        </ViberShareButton>

        <TwitterShareButton {...buttonProps}>
            <TwitterIcon {...iconsProps} />
        </TwitterShareButton>
    </div>
}

export default function Waiting() {
    const roomCode = useSelector<RootState>(state => state.room.id) as string

    console.log(roomCode)

    return (
        <div className="waiting-ui">
            <Link className="home" url="/">
                <i className="fas fa-home"></i>
            </Link>

            <div className="code">
                Room code: <strong>{roomCode}</strong>

                <ShareCode code={roomCode} />
            </div>

            <h3>
                Waiting for other players to join this room
            </h3>
        </div >
    )
}