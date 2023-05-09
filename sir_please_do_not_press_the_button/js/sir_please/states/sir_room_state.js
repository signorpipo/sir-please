import { GamepadButtonID, Globals } from "../../pp";
import { GameGlobals } from "../game_globals";

export class SirRoomState {
    constructor() {
        this._myPlayerSpawn = GameGlobals.mySirRoom.pp_getObjectByName("Player Spawn");

        this._myParentFSM = null;


        this._myBackgroundMusicAudioPlayer = Globals.getAudioManager().createAudioPlayer("background_music");
    }

    start(fsm) {
        this._myParentFSM = fsm;

        GameGlobals.myBlackFader.fadeOut(true);
        GameGlobals.myPlayerLocomotion.setIdle(false);

        let playerStartPosition = this._myPlayerSpawn.pp_getPosition();
        let rotationQuat = this._myPlayerSpawn.pp_getRotationQuat();
        GameGlobals.myPlayerTransformManager.teleportAndReset(playerStartPosition, rotationQuat);

        GameGlobals.myBlackFader.fadeIn();

        if (this._myBackgroundMusicAudioPlayer != null) {
            this._myBackgroundMusicAudioPlayer.play();
        }
    }

    end(fsm) {
        if (this._myBackgroundMusicAudioPlayer != null) {
            this._myBackgroundMusicAudioPlayer.stop();
        }
    }

    update(dt, fsm) {
        if (GameGlobals.myDebugEnabled && Globals.getLeftGamepad().getButtonInfo(GamepadButtonID.TOP_BUTTON).isPressStart(2)) {
            this._myParentFSM.perform("lose");
        } else if (GameGlobals.myDebugEnabled && Globals.getLeftGamepad().getButtonInfo(GamepadButtonID.BOTTOM_BUTTON).isPressStart(2)) {
            this._myParentFSM.perform("lose");
        }
    }
}