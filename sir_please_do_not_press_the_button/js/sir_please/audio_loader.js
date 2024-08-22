import { AudioSetup, Globals } from "../pp";

export class AudioLoader {
    load() {
        let manager = Globals.getAudioManager();

        {
            let audioSetup = new AudioSetup("assets/audio/music/pp/playground_ambient.mp3");
            audioSetup.myLoop = true;
            audioSetup.mySpatial = false;
            audioSetup.myVolume = 1;
            manager.addAudioSetup("background_music", audioSetup);
        }

        {
            let audioSetup = new AudioSetup("assets/audio/sfx/pp/collision.mp3");
            audioSetup.myRate = 1;
            audioSetup.myVolume = 1;
            audioSetup.myReferenceDistance = 1;
            manager.addAudioSetup("click", audioSetup);
        }

        {
            let audioSetup = new AudioSetup("assets/audio/sfx/pp/collision.mp3");
            audioSetup.myRate = 1;
            audioSetup.myVolume = 1;
            audioSetup.myReferenceDistance = 1000;
            manager.addAudioSetup("clickEarth", audioSetup);
        }

        {
            let audioSetup = new AudioSetup("assets/audio/sfx/pp/grab.mp3");
            audioSetup.myRate = 1;
            audioSetup.myVolume = 1;
            audioSetup.myReferenceDistance = 1000;
            manager.addAudioSetup("explode", audioSetup);
        }

        {
            let audioSetup = new AudioSetup("assets/audio/sfx/alert.mp3");
            audioSetup.myRate = 1;
            audioSetup.myVolume = 1;
            audioSetup.myReferenceDistance = 1000;
            manager.addAudioSetup("alert", audioSetup);
        }

        {
            let audioSetup = new AudioSetup("assets/audio/sfx/blip.wav");
            audioSetup.myRate = 1;
            audioSetup.myVolume = 0.4;
            audioSetup.myReferenceDistance = 1000;
            manager.addAudioSetup("blip", audioSetup);
        }
    }
}