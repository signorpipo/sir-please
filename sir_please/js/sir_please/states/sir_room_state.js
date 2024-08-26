import { FSM, GamepadButtonID, Globals, Handedness, InputSourceType, InputUtils, MathUtils, TimerState, XRUtils } from "../../pp";
import { GameGlobals } from "../game_globals";

export class SirRoomState {
    constructor() {
        this._myPlayerSpawn = GameGlobals.mySirRoom.pp_getObjectByName("Player Spawn");
        this._myPlayerSpawnHand = GameGlobals.mySirRoom.pp_getObjectByName("Player Spawn Hand");

        this._myParentFSM = null;

        this._myLastLeftHandType = null;

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

        this._mySetButtonHeightDirty = false;
        XRUtils.registerSessionStartEndEventListeners(this, this._onXRSessionStart.bind(this), this._onXRSessionEnd.bind(this), true, false);
    }

    start(fsm) {
        this._myParentFSM = fsm;

        GameGlobals.myEarthView.pp_setActive(false);
        GameGlobals.myExplodeButton.setActive(true);

        this._myFSM.perform("start");
    }

    end(fsm) {
        if (this._myBackgroundMusicAudioPlayer != null) {
            this._myBackgroundMusicAudioPlayer.fade(1, 0, 0.01);
        }

        GameGlobals.myExplodeButton.setActive(false);
        GameGlobals.myButtonHand.stopButtonHand();
        GameGlobals.mySirDialog.stopSirDialog();

        this._myFSM.perform("skip");

        this._myLastLeftHandType = null;
    }


    update(dt, fsm) {
        if (GameGlobals.myPlayerLocomotion._myPlayerHeadManager.isSynced()) {
            if (this._mySetButtonHeightDirty) {
                this._mySetButtonHeightDirty = false;

                this._setButtonHeight();
            }
        }

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
            if (!this._myBackgroundMusicAudioPlayer.isPlaying()) {
                this._myBackgroundMusicAudioPlayer.play();
            }

            this._myBackgroundMusicAudioPlayer.fade(0, 1, 1);
        }

        GameGlobals.myButtonHand.startButtonHand();
        GameGlobals.mySirDialog.startSirDialog();

        this._setButtonHeight();
    }

    _win() {
        this._myParentFSM.perform("win");
    }

    _gameUpdate(dt, fsm) {
        if (GameGlobals.myPlayerLocomotion._myPlayerHeadManager.isSynced()) {
            let currentLeftHandType = InputUtils.getInputSourceTypeByHandedness(Handedness.LEFT);
            if (currentLeftHandType != this._myLastLeftHandType && currentLeftHandType == InputSourceType.TRACKED_HAND) {

                let playerStartPosition = this._myPlayerSpawnHand.pp_getPosition();
                let rotationQuat = this._myPlayerSpawnHand.pp_getRotationQuat();
                GameGlobals.myPlayerTransformManager.teleportAndReset(playerStartPosition, rotationQuat);
                Globals.getPlayerObjects().myCameraNonXR.pp_setUp(GameGlobals.myUp);
            }

            this._myLastLeftHandType = currentLeftHandType;
        }

        if (GameGlobals.myDebugEnabled && Globals.getLeftGamepad().getButtonInfo(GamepadButtonID.TOP_BUTTON).isPressStart(2)) {
            this._myParentFSM.perform("lose");
        } else if (GameGlobals.myDebugEnabled && Globals.getLeftGamepad().getButtonInfo(GamepadButtonID.BOTTOM_BUTTON).isPressStart(2)) {
            this._myFSM.perform("win");
        }

        if (GameGlobals.mySirDialog.isWin()) {
            this._myFSM.perform("win");
        }
    }

    _setButtonHeight() {
        if (XRUtils.isSessionActive()) {
            const height = GameGlobals.myPlayerTransformManager.getHeight();
            GameGlobals.mySirDialog.object.pp_setPositionLocal([0.1, MathUtils.mapToRange(height, 1.3, 1.8, 0.9, 1.1), 0.75]);
        } else {
            GameGlobals.mySirDialog.object.pp_setPositionLocal([0.1, 1.1, 0.75]);
        }
    }

    _onXRSessionStart() {
        this._mySetButtonHeightDirty = true;

        let referenceSpace = XRUtils.getReferenceSpace();
        referenceSpace.addEventListener("reset", () => { this._mySetButtonHeightDirty = true; });
    }

    _onXRSessionEnd() {
        this._mySetButtonHeightDirty = false;
        this._setButtonHeight();
    }
}