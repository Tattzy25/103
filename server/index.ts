import express from "express";
import sttRouter from "./routes/stt";
import translateRouter from "./routes/translate";
import ttsRouter from "./routes/tts";
import accessRouter from "./routes/access";
import ablyAccessRouter from "./routes/ablyAccess";
import ablyChannelRouter from "./routes/ablyChannel";
import { generateAccessCode } from "./routes/generateAccessCode";
import { joinChannel } from "./routes/joinChannel";
import languagesRouter from "./routes/languages";
import voiceLabRouter from "./routes/voiceLab";

// Import callback handlers
import deeplTranslateCallback from "./routes/callbacks/deepl-translate";
import elevenlabsSynthesizeCallback from "./routes/callbacks/elevenlabs-synthesize";
import voiceIdGenerateCallback from "./routes/callbacks/voice-id-generate";
import ablyPublishCallback from "./routes/callbacks/ably-publish";
import soloResultRouter from "./routes/soloResult";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register workflow routes
app.use("/api", sttRouter);
app.use("/api", translateRouter);
app.use("/api", ttsRouter);

// Register callback routes for message queue workflow
app.use("/api/callbacks", deeplTranslateCallback);
app.use("/api/callbacks", elevenlabsSynthesizeCallback);
app.use("/api/callbacks", voiceIdGenerateCallback);
app.use("/api/callbacks", ablyPublishCallback);

// Register solo mode result route
app.use("/api", soloResultRouter);

// Register languages route
app.use("/api", languagesRouter);

// Register voice lab routes
app.use("/api/voice-lab", voiceLabRouter);

// Register access code routes
app.use("/api/access", accessRouter);
app.use("/api/ably-access", ablyAccessRouter);
app.use("/api/ably-channel", ablyChannelRouter);
app.post("/api/generate-access-code", generateAccessCode);
app.post("/api/join-channel", joinChannel);

// Add any other middleware or error handlers here

export default app;
