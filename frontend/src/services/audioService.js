import api from "./api";

class AudioService {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Browser does not support audio recording.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.start();
    }

    async stopRecording() {
        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
                resolve(audioBlob);
            };
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        });
    }

    async transcribe(audioBlob) {
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");

        const response = await api.post("/audio/stt", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data.text;
    }

    async speak(text) {
        console.log("Requesting TTS for:", text);
        const response = await api.post("/audio/tts", { text }, {
            responseType: "blob",
        });

        console.log("Received TTS response:", response.data.size, "bytes", response.data.type);
        if (response.data.size === 0) {
            throw new Error("Received empty audio blob");
        }

        const audioUrl = URL.createObjectURL(response.data);
        const audio = new Audio();
        audio.src = audioUrl;
        
        // Revoke the object URL when audio finishes to avoid memory leaks
        audio.addEventListener("ended", () => URL.revokeObjectURL(audioUrl), { once: true });

        return new Promise((resolve, reject) => {
            audio.oncanplaythrough = async () => {
                // Prevent this handler from firing multiple times
                audio.oncanplaythrough = null;
                try {
                    await audio.play();
                    console.log("Audio playing started");
                    resolve(audio);
                } catch (err) {
                    console.error("Playback failed:", err);
                    reject(err);
                }
            };
            audio.onerror = (err) => {
                console.error("Audio error:", err);
                URL.revokeObjectURL(audioUrl);
                reject(err);
            };
        });
    }
}

const audioService = new AudioService();
export default audioService;
