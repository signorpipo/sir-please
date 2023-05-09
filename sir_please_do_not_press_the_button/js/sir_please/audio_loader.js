import { AudioSetup, Globals } from "../pp";

export class AudioLoader {
    load() {
        let manager = Globals.getAudioManager();

        {
            let audioSetup = new AudioSetup("null");
            audioSetup.myLoop = true;
            audioSetup.mySpatial = false;
            audioSetup.myVolume = 2;
            manager.addAudioSetup("background_music", audioSetup);
        }
    }
}