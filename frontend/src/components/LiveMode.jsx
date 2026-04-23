import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Mic, MicOff, Loader2, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import audioService from "@/services/audioService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LiveMode = ({ isOpen, onClose, activeChatId, onChatIdReceived }) => {
    const [status, setStatus] = useState("idle"); // idle, listening, thinking, speaking, error
    const [userTranscript, setUserTranscript] = useState("");
    const [botCaption, setBotCaption] = useState("");
    const [isMicOn, setIsMicOn] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [highlightIndex, setHighlightIndex] = useState(-1); // word-by-word karaoke index

    const mediaStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const currentAudioRef = useRef(null);
    const isProcessingRef = useRef(false);
    const silenceTimerRef = useRef(null);
    const analyserRef = useRef(null);
    const silenceStartRef = useRef(null);
    const rafRef = useRef(null);
    const wordTimerRef = useRef(null);
    const activeChatIdRef = useRef(activeChatId);
    const isMicOnRef = useRef(isMicOn);
    const isOpenRef = useRef(isOpen);

    useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
    useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    // Browser SpeechSynthesis fallback when ElevenLabs TTS fails
    const speakWithBrowserTTS = useCallback((text) => {
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
        });
    }, []);

    // Stop the microphone stream entirely
    const stopMicStream = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            try { mediaRecorderRef.current.stop(); } catch (e) { /* ignore */ }
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }
        analyserRef.current = null;
    }, []);

    // Process a recorded audio blob: STT → Chat → TTS
    const processAudioBlob = useCallback(async (audioBlob) => {
        setStatus("thinking");
        setUserTranscript("Transcribing...");
        setBotCaption(""); // Clear previous bot response when starting new one
        setErrorMsg("");

        try {
            // 1. STT via backend ElevenLabs
            console.log("[LiveMode] Sending audio for STT, size:", audioBlob.size);
            const formData = new FormData();
            formData.append("file", audioBlob, "recording.webm");
            const sttResponse = await api.post("/audio/stt", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const transcript = sttResponse.data.text?.trim();
            console.log("[LiveMode] Transcript:", transcript);

            if (!transcript || transcript.length < 2) {
                console.log("[LiveMode] Empty/short transcript, skipping");
                setUserTranscript("");
                setStatus("idle");
                isProcessingRef.current = false;
                return false;
            }

            setUserTranscript(transcript);

            // 2. Send to RAG backend
            console.log("[LiveMode] Sending to /chat...");
            const chatResponse = await api.post("/chat", {
                message: transcript,
                chat_id: activeChatIdRef.current,
                history: [],
            });

            const botText = chatResponse.data.response;
            console.log("[LiveMode] Got response:", botText?.substring(0, 80));
            setBotCaption(botText);

            if (!activeChatIdRef.current && chatResponse.data.chat_id) {
                activeChatIdRef.current = chatResponse.data.chat_id;
                onChatIdReceived?.(chatResponse.data.chat_id);
            }

            // 3. TTS (ElevenLabs with browser fallback)
            setStatus("speaking");
            setHighlightIndex(-1);
            const words = botText.split(/\s+/);

            // Helper: start word-by-word highlight timer
            const startWordTimer = (duration) => {
                if (wordTimerRef.current) clearInterval(wordTimerRef.current);
                if (words.length === 0 || !duration) return;
                // Time per word, with a small leading delay
                const msPerWord = (duration * 1000) / words.length;
                let idx = 0;
                setHighlightIndex(0);
                wordTimerRef.current = setInterval(() => {
                    idx++;
                    if (idx >= words.length) {
                        clearInterval(wordTimerRef.current);
                        wordTimerRef.current = null;
                        setHighlightIndex(words.length); // all highlighted
                    } else {
                        setHighlightIndex(idx);
                    }
                }, msPerWord);
            };

            try {
                const audio = await audioService.speak(botText);
                currentAudioRef.current = audio;
                // Start word highlight using audio duration
                startWordTimer(audio.duration || (words.length * 0.35));

                await new Promise((resolve) => {
                    audio.onended = () => {
                        currentAudioRef.current = null;
                        if (wordTimerRef.current) clearInterval(wordTimerRef.current);
                        setHighlightIndex(words.length); // ensure all words highlighted
                        resolve();
                    };
                });
            } catch (ttsError) {
                console.warn("[LiveMode] ElevenLabs TTS failed, using browser TTS:", ttsError);
                // For browser TTS, estimate ~0.35s per word
                startWordTimer(words.length * 0.35);
                await speakWithBrowserTTS(botText);
                if (wordTimerRef.current) clearInterval(wordTimerRef.current);
                setHighlightIndex(words.length);
            }

            // Done speaking — return to idle/listening but KEEP the text visible
            setStatus("idle");
            setHighlightIndex(-1);
            isProcessingRef.current = false;
            return true;

        } catch (error) {
            console.error("[LiveMode] Processing error:", error);
            const msg = error?.response?.data?.detail || error.message || "Something went wrong";
            setErrorMsg(msg);
            setStatus("error");
            isProcessingRef.current = false;

            // Auto-recover after 3s
            setTimeout(() => {
                setErrorMsg("");
                setStatus("idle");
            }, 3000);
            return false;
        }
    }, [onChatIdReceived, speakWithBrowserTTS]);

    // Start recording with voice activity detection (VAD)
    const startListening = useCallback(async () => {
        if (isProcessingRef.current) return;

        try {
            setErrorMsg("");

            // Reuse existing mic stream if available, otherwise request new one
            if (!mediaStreamRef.current || !mediaStreamRef.current.active) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;
            }

            const stream = mediaStreamRef.current;

            // Set up analyser for voice activity detection
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.3;
            source.connect(analyser);
            analyserRef.current = analyser;

            // Start MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : "audio/webm";
            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                // Close only the audio context (not the mic stream — reuse it)
                audioCtx.close().catch(() => {});
                analyserRef.current = null;

                const blob = new Blob(chunksRef.current, { type: mimeType });
                chunksRef.current = [];

                if (blob.size < 1000) {
                    // Too small, skip processing and restart
                    console.log("[LiveMode] Audio too small, restarting...");
                    if (isOpenRef.current && isMicOnRef.current) {
                        startListening();
                    }
                    return;
                }

                // Process the recording
                isProcessingRef.current = true;
                await processAudioBlob(blob);

                // After processing, auto-restart listening (hands-free loop)
                if (isOpenRef.current && isMicOnRef.current && !isProcessingRef.current) {
                    startListening();
                }
            };

            recorder.start(250); // collect data every 250ms
            setStatus("listening");
            silenceStartRef.current = null;

            // Voice Activity Detection loop
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const SILENCE_THRESHOLD = 15; // amplitude threshold
            const SILENCE_DURATION = 1800; // 1.8s of silence after voice → process
            let hasDetectedVoice = false; // Must hear voice before silence triggers

            const checkVoiceActivity = () => {
                if (!analyserRef.current || !isOpenRef.current) return;

                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

                if (average > SILENCE_THRESHOLD) {
                    // Voice detected
                    hasDetectedVoice = true;
                    silenceStartRef.current = null;
                } else if (hasDetectedVoice) {
                    // Silence AFTER voice was detected
                    if (!silenceStartRef.current) {
                        silenceStartRef.current = Date.now();
                    } else if (Date.now() - silenceStartRef.current > SILENCE_DURATION) {
                        // User stopped speaking — stop recording and process
                        console.log("[LiveMode] User stopped speaking, processing...");
                        silenceStartRef.current = null;
                        if (recorder.state === "recording") {
                            recorder.stop();
                            return; // stop the RAF loop
                        }
                    }
                }
                // else: silence but no voice detected yet — keep waiting

                rafRef.current = requestAnimationFrame(checkVoiceActivity);
            };

            rafRef.current = requestAnimationFrame(checkVoiceActivity);

        } catch (error) {
            console.error("[LiveMode] Mic access error:", error);
            setErrorMsg("Could not access microphone. Please check permissions.");
            setStatus("error");
        }
    }, [processAudioBlob]);

    // Start/stop based on isOpen and isMicOn
    useEffect(() => {
        if (isOpen && isMicOn) {
            if (!isProcessingRef.current) {
                startListening();
            }
        } else {
            stopMicStream();
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
            if (!isOpen) {
                setStatus("idle");
                setUserTranscript("");
                setBotCaption("");
                setErrorMsg("");
                setIsMicOn(true);
                isProcessingRef.current = false;
            }
        }

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isOpen, isMicOn, startListening, stopMicStream]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-2xl animate-in fade-in duration-500">
            <div className="relative w-full max-w-2xl bg-card border border-border/50 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">RAG Live Mode</h2>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    status === "listening" ? "bg-green-500 animate-pulse" :
                                    status === "thinking" ? "bg-yellow-500 animate-bounce" :
                                    status === "speaking" ? "bg-primary animate-pulse" :
                                    status === "error" ? "bg-red-500 animate-pulse" : "bg-muted-foreground"
                                )} />
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    {!isMicOn ? "Microphone Muted" :
                                     status === "error" ? "Error" :
                                     status === "idle" ? "Starting Mic..." :
                                     status === "listening" ? "Listening..." :
                                     status === "thinking" ? "Processing..." : "AI Speaking"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Main Visualizer Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-0">

                    {/* Animated Waves */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className={cn(
                            "absolute w-[250px] h-[250px] border-2 border-primary/30 rounded-full transition-all duration-500",
                            status === "speaking" ? "scale-110 animate-ping" : status === "listening" ? "scale-105 border-green-500/30" : "scale-100"
                        )} />
                        <div className={cn(
                            "absolute w-[180px] h-[180px] border border-primary/20 rounded-full transition-all duration-700",
                            status === "speaking" ? "scale-125" : status === "listening" ? "scale-110 border-green-500/20" : "scale-100"
                        )} />
                    </div>

                    <div className="relative z-10 space-y-4 text-center w-full flex flex-col items-center min-h-0">
                        <div className={cn(
                            "w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center shadow-2xl border-[3px] transition-all duration-500",
                            status === "speaking" ? "bg-primary text-primary-foreground border-primary/50 scale-110 shadow-primary/20" :
                            status === "listening" ? "bg-green-500/10 text-green-500 border-green-500/50 scale-105" :
                            status === "error" ? "bg-red-500/10 text-red-500 border-red-500/50" :
                            "bg-card border-border/50 text-muted-foreground"
                        )}>
                            {status === "thinking" ? <Loader2 className="h-9 w-9 animate-spin" /> :
                             status === "error" ? <X className="h-9 w-9" /> :
                             <Bot className="h-9 w-9" />}
                        </div>

                        {/* Caption Area — scrollable */}
                        <div className="w-full px-2 space-y-3 overflow-y-auto max-h-[calc(100%-6rem)] scrollbar-hide">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">You</p>
                                <p className={cn(
                                    "text-base font-medium transition-opacity duration-300",
                                    (status === "listening" || status === "thinking") ? "text-foreground opacity-100" : "text-muted-foreground opacity-40"
                                )}>
                                    {userTranscript || "..."}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Veridoc AI</p>
                                <div className={cn(
                                    "text-sm font-medium leading-relaxed transition-all duration-500",
                                    (status === "speaking" || botCaption) ? "opacity-100 translate-y-0" :
                                    status === "error" ? "text-red-500 opacity-100 translate-y-0" :
                                    "text-muted-foreground opacity-0 translate-y-4"
                                )}>
                                    {errorMsg ? (
                                        <span className="text-red-500">{errorMsg}</span>
                                    ) : status === "speaking" && botCaption ? (
                                        // Karaoke word-by-word highlight
                                        botCaption.split(/\s+/).map((word, i) => (
                                            <span
                                                key={i}
                                                className={cn(
                                                    "transition-colors duration-200 inline",
                                                    i <= highlightIndex
                                                        ? "text-foreground"
                                                        : "text-muted-foreground/30"
                                                )}
                                            >
                                                {word}{" "}
                                            </span>
                                        ))
                                    ) : botCaption ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-left prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-4">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {botCaption}
                                            </ReactMarkdown>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-6 bg-muted/30 border-t border-border/50">
                    <div className="flex items-center justify-center gap-12">
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => {
                                    setErrorMsg("");
                                    if (status === "error") setStatus("idle");
                                    setIsMicOn(!isMicOn);
                                }}
                                className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all",
                                    isMicOn ? "bg-primary text-primary-foreground" : "bg-red-500/10 text-red-500"
                                )}
                            >
                                {isMicOn ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {isMicOn ? "Mic Active" : "Mic Muted"}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={onClose}
                                className="w-16 h-16 rounded-full bg-muted border border-border/50 text-foreground flex items-center justify-center shadow-xl hover:bg-card transition-all hover:scale-105"
                            >
                                <X className="h-8 w-8" />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Mode</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMode;
