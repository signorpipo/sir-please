import {Component, Property} from '@wonderlandengine/api';
import {DialogManager} from './dialog-manager'

/**
 * dialog-controller
 */
export class DialogController extends Component {
    static TypeName = 'dialog-controller';
    /* Properties that are configurable in the editor */
    static Properties = {
        dialogManager: Property.object(),
        text: Property.object(),
        responseOneText: Property.object(),
        responseTwoText: Property.object(),
        dialog: Property.string(""),
        charDelay: Property.float(0.025),
        blankDelay: Property.float(0.5),
    };

    init() {
        this.reset();
        this.currentText = '> ';
        this.responseTexts = new Array();
        this.responseTexts.push(this.responseOneText.getComponent('text'));
        this.responseTexts.push(this.responseTwoText.getComponent('text'));
    }

    reset() {
        this.currentText = '> ';
        this.currentState = "";
        this.currentStateJSON = null;
        this.textReadPos = 0;
        this.timer = 0.0;
    }

    play() {
        if(this.currentStateJSON) return;
        this.reset();
        this.playingDialog = this.dialogManager.getComponent('dialog-manager').getDialog(this.dialog);
        this.currentState = "starting";
    }

    update(dt) {
        if(this.currentState == "") return;

        if(this.currentState == "starting") {
            this.reset();
            this.currentStateJSON = this.playingDialog["entry"];
            this.currentState = "entry";
        }

        var desiredText = this.currentStateJSON["text"];
        if(this.textReadPos < desiredText.length) {
            const char = desiredText[this.textReadPos];
            // TODO: Handle events

            const ignore = char == '_';
            const delay = char == '_' ? this.blankDelay : this.charDelay;

            this.timer += dt;
            if(this.timer < delay) return;
            this.timer -= delay;

            if(!ignore) this.currentText += char;
            ++this.textReadPos;

            if(this.textReadPos >= desiredText.length) {
                this.setupResponses();
            }
        } else {
            var autoAdvanceTime = this.currentStateJSON["autoAdvanceAfter"];
            if(autoAdvanceTime) {
                this.timer += dt;
                if(this.timer < autoAdvanceTime) return;
                this.timer -= autoAdvanceTime;
                this.advance(-1);
            }
        }

        this.text.getComponent('text').text = this.currentText;
    }

    advance(choiceIndex) {
        if(!this.currentStateJSON) return;

        var responses = this.currentStateJSON["responses"];

        var jump = responses ? null : this.currentStateJSON["jump"];
        if(!jump && responses && choiceIndex != -1) {
            var response = responses[choiceIndex];
            if(!response) {
                console.log("Cannot advance with invalid response!");
                return;
            }
            jump = response["jump"];
        }

        // Cannot advance without a response
        if(!jump && responses) {
            console.log("Cannot advance current dialog without response!");
            return;
        }

        if(!jump && jump != "") {
            var keys = Object.keys(this.playingDialog);
            var index = keys.indexOf(this.currentState);
            this.reset();

            if(index + 1 >= keys.length) {
                // Done!
                this.dialogManager.getComponent('dialog-manager').end(this);
                return;
            }
            this.currentState = keys[index + 1];
            this.currentStateJSON = this.playingDialog[this.currentState];
            return;
        }

        this.reset();
        this.currentStateJSON = this.playingDialog[jump];
        this.currentState = jump;
    }

    setupResponses() {
        var responses = this.currentStateJSON["responses"];
        if(!responses) return;
        for(var i = 0; i < responses.length; ++i) {
            var response = responses[i]["text"];
            this.responseTexts[i].text = response;
        }
    }
}
