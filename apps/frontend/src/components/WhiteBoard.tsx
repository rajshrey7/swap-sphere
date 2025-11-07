import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { Tldraw } from "@tldraw/tldraw";
import '@tldraw/tldraw/tldraw.css';

export const WhiteBoard = () => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
            <LiveblocksProvider publicApiKey="pk_dev_lx1VTmGizon0kxJgXU9hy6PNeRbays56S3RlB9Xd5ArMhDONjAWOaKMhdlMbMyRq" >
                <RoomProvider id="whiteboard-room">
                    <Tldraw licenseKey="tldraw-2026-02-15/WyI4TC0yU3RCbCIsWyIqIl0sMTYsIjIwMjYtMDItMTUiXQ.VyCsk4n3E+psesnVH2v9z9AUbpeUKAV72RaU93WR3ZPG8j5yycS5yRDEwmLIaVn2NRGrqzk7un0Od9wea0PQUg" />
                </RoomProvider>
            </LiveblocksProvider>
        </div>
    )
}