import { Component, Property } from "@wonderlandengine/api";
import { Globals, XRUtils } from "../../pp";
import { AnalyticsUtils } from "../analytics_utils";
import { GameGlobals } from "../game_globals";
import { initSirPlease } from "../init_sir_please";
import { SirPlease } from "../sir_please";
import { FadeViewInOutComponent } from "./fade_view_in_out_component";
import { HideHandsComponent } from "./hide_hands";

let _alreadyRegisteredEngines = [];

export class SirPleaseGatewayComponent extends Component {
    static TypeName = "sir-please-gateway";
    static Properties = {
        _myDebugEnabled: Property.bool(false),
        _mySkipIntro: Property.bool(false),
        _myClearConsoleOnStart: Property.bool(true),

        _myStartDelayFrames: Property.int(0),

        _mySirRoom: Property.object(),
        _myEarthView: Property.object(),

        _myGold: Property.material(),
        _myCyan: Property.material()
    };

    static onRegister(engine) {
        if (!_alreadyRegisteredEngines.includes(engine)) {
            _alreadyRegisteredEngines.push(engine)
            initSirPlease(engine);
        }
    }

    start() {
        GameGlobals.myGoldMaterial = this._myGold;
        GameGlobals.myCyanMaterial = this._myCyan;

        GameGlobals.myScene = this.object;
        GameGlobals.mySirRoom = this._mySirRoom;
        GameGlobals.myEarthView = this._myEarthView;

        GameGlobals.myBlackFader = GameGlobals.myScene.pp_getObjectByName("Black Fader").pp_getComponent(FadeViewInOutComponent);

        GameGlobals.myDebugEnabled = this._myDebugEnabled && Globals.isDebugEnabled();
        GameGlobals.mySkipIntro = this._mySkipIntro && GameGlobals.myDebugEnabled;
        GameGlobals.myHideHands = GameGlobals.myScene.pp_getComponent(HideHandsComponent);

        if (GameGlobals.myDebugEnabled) {
            window.GameGlobals = GameGlobals;
        }

        this._myGame = new SirPlease();

        this._myStartCounter = this._myStartDelayFrames;

        this._myFirstUpdate = true;

        AnalyticsUtils.sendEventOnce("game_loaded", false);

        XRUtils.registerSessionStartEndEventListeners(this, this._onXRSessionStart.bind(this), null, true, false);
    }

    update(dt) {
        if (this._myFirstUpdate) {
            this._myFirstUpdate = false;
            GameGlobals.myBlackFader.fadeOut(true);
            GameGlobals.myHideHands.hide();
        }

        if (this._myStartCounter > 0) {
            this._myStartCounter--;
            if (this._myStartCounter == 0) {

                let currentVersion = "1.0.0";
                console.log("Game Version:", currentVersion);

                this._start();
            }
        } else {
            this._myGame.update(dt);
        }
    }

    _start() {
        if (this._myClearConsoleOnStart) {
            console.clear();
        }

        this._myGame.start();

        GameGlobals.myStarted = true;
    }

    _onXRSessionStart() {
        AnalyticsUtils.sendEventOnce("enter_session", false);
    }
}