import { FSM, Globals, PlayerLocomotionComponent } from "../pp";
import { AudioLoader } from "./audio_loader";
import { FadeViewInOutComponent } from "./components/fade_view_in_out_component";
import { GameGlobals } from "./game_globals";
import { GameState } from "./states/game_state";

export class SirPlease {
    constructor() {
        this._myFSM = new FSM();
        //this._myFSM.setLogEnabled(true, "Sir Please");

        this._myFSM.addState("init");
        this._myFSM.addState("game", new GameState());

        this._myFSM.addTransition("init", "game", "start");
        this._myFSM.addTransition("game", "game", "end");

        this._myFSM.init("init");
    }

    start() {
        this._myAudioLoader = new AudioLoader();
        this._myAudioLoader.load();

        this._collectSceneObjects();

        this._myFSM.perform("start");
    }

    update(dt) {
        this._myFSM.update(dt);
    }

    _collectSceneObjects() {
        let playerLocomotionComponent = Globals.getScene().pp_getComponent(PlayerLocomotionComponent);
        GameGlobals.myPlayerLocomotion = playerLocomotionComponent._myPlayerLocomotion;
        GameGlobals.myPlayerTransformManager = playerLocomotionComponent._myPlayerLocomotion._myPlayerTransformManager;

        GameGlobals.myBlackFader = GameGlobals.myScene.pp_getObjectByName("Black Fader").pp_getComponent(FadeViewInOutComponent);
    }
}