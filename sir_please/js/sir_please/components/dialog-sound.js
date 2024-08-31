import { Component, Property } from '@wonderlandengine/api';
import { DialogManager } from '../../dialog/dialog-manager';
import { Globals } from "../../pp";
import { GameGlobals } from '../game_globals';

/**
 * dialog-sound
 */
export class DialogSound extends Component {
    static TypeName = 'dialog-sound';
    /* Properties that are configurable in the editor */
    static Properties = {
        dialogManager: Property.object(1.0)
    };
    /* Add other component types here that your component may
     * create. They will be registered with this component */
    static Dependencies = [];

    init() {
        this.audioPlayers = new Map();
        this.firstUpdate = true;
    }

    start() {
        this.dialogManager.getComponent(DialogManager).addSound("alert", "alert");
        this.dialogManager.getComponent(DialogManager).addSound("blip", "blip");
    }

    update(dt) {
        if (GameGlobals.myStarted) {
            if (this.firstUpdate) {
                this.firstUpdate = false;

                let blipPlayer = Globals.getAudioManager().createAudioPlayer("blip");

                let sounds = [];
                for (let i = 0; i < blipPlayer._myAudio._pool; i++) {
                    let sound = blipPlayer._myAudio._inactiveSound();
                    sound._ended = false;
                    sounds.push(sound);
                }

                for (let sound of sounds) {
                    sound._ended = true;
                }

                this.audioPlayers.set("blip", blipPlayer);
            }
        }
    }

    onSound(path) {
        if (!GameGlobals.myStarted || this.firstUpdate) return;

        if (!this.audioPlayers.has(path) || !this.audioPlayers.get(path)) {
            this.audioPlayers.set(path, Globals.getAudioManager().createAudioPlayer(path));
        }

        var player = this.audioPlayers.get(path);
        player.setPosition(this.object.pp_getPosition());
        player.play();
    }
}
