import { FSM, GamepadButtonID, Globals, TimerState } from "../../pp";
import { GameGlobals } from "../game_globals";

export class SirRoomState {
    constructor() {
        this._myPlayerSpawn = GameGlobals.mySirRoom.pp_getObjectByName("Player Spawn");

        this._myParentFSM = null;

        this._myBackgroundMusicAudioPlayer = Globals.getAudioManager().createAudioPlayer("background_music");

        this._myFSM = new FSM();
        //this._myFSM.setLogEnabled(true, "  Sir Room");

        this._myFSM.addState("init");
        this._myFSM.addState("idle");
        this._myFSM.addState("game", this._gameUpdate.bind(this));
        this._myFSM.addState("win_wait", new TimerState(1, "end"));

        this._myFSM.addTransition("init", "idle", "start");
        this._myFSM.addTransition("idle", "game", "start", this._startGame.bind(this));
        this._myFSM.addTransition("game", "win_wait", "win");
        this._myFSM.addTransition("win_wait", "idle", "end", this._win.bind(this));

        this._myFSM.addTransition("idle", "idle", "skip");
        this._myFSM.addTransition("game", "idle", "skip");
        this._myFSM.addTransition("win_wait", "idle", "skip");

        this._myFSM.init("init");
        this._myFSM.perform("start");
    }

    start(fsm) {
        this._myParentFSM = fsm;

        this._myFSM.perform("start");
    }

    end(fsm) {
        if (this._myBackgroundMusicAudioPlayer != null) {
            this._myBackgroundMusicAudioPlayer.stop();
        }

        GameGlobals.myButtonHand.stopButtonHand();
        GameGlobals.mySirDialog.stopSirDialog();

        this._myFSM.perform("skip");
    }


    update(dt, fsm) {
        this._myFSM.update(dt);
    }

    _startGame() {
        GameGlobals.myBlackFader.fadeOut(true);
        GameGlobals.myPlayerLocomotion.setIdle(false);

        let playerStartPosition = this._myPlayerSpawn.pp_getPosition();
        let rotationQuat = this._myPlayerSpawn.pp_getRotationQuat();
        GameGlobals.myPlayerTransformManager.teleportAndReset(playerStartPosition, rotationQuat);
        Globals.getPlayerObjects().myCameraNonXR.pp_setUp(GameGlobals.myUp);

        GameGlobals.myBlackFader.fadeIn();
        GameGlobals.myHideHands.show();

        if (this._myBackgroundMusicAudioPlayer != null) {
            this._myBackgroundMusicAudioPlayer.play();
        }

        GameGlobals.myButtonHand.startButtonHand();
        GameGlobals.mySirDialog.startSirDialog();
    }

    _win() {
        this._myParentFSM.perform("win");
    }

    _gameUpdate(dt, fsm) {
        if (GameGlobals.myDebugEnabled && Globals.getLeftGamepad().getButtonInfo(GamepadButtonID.TOP_BUTTON).isPressStart(2)) {
            this._myParentFSM.perform("lose");
        } else if (GameGlobals.myDebugEnabled && Globals.getLeftGamepad().getButtonInfo(GamepadButtonID.BOTTOM_BUTTON).isPressStart(2)) {
            this._myFSM.perform("win");
        }

        if (GameGlobals.mySirDialog.isWin()) {
            this._myFSM.perform("win");
        }
    }
}