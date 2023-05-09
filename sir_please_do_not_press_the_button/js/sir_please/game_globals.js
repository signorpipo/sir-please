import { vec3_create } from "../pp";

export let GameGlobals = {
    myScene: null,
    mySirRoom: null,
    myEarthView: null,

    myUp: vec3_create(0, 1, 0),

    myStarted: false,

    myPlayerLocomotion: null,
    myPlayerTransformManager: null,

    myBlackFader: null,

    myDebugEnabled: false
};