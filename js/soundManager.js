class SoundManager {
    constructor() {
        this.synth = new Tone.Synth().toDestination();
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            await Tone.start();
            this.initialized = true;
        }
    }

    playBounce() {
        if (this.initialized) {
            this.synth.triggerAttackRelease("C4", "32n");
        }
    }

    playScore() {
        if (this.initialized) {
            this.synth.triggerAttackRelease("G4", "8n");
        }
    }

    playHit() {
        if (this.initialized) {
            this.synth.triggerAttackRelease("E4", "16n");
        }
    }
}
