import express from "express";
import sttRouter from "./routes/stt";
import translateRouter from "./routes/translate";
import ttsRouter from "./routes/tts";
import accessRouter from "./routes/access";
import ablyAccessRouter from "./routes/ablyAccess";
import ablyChannelRouter from "./routes/ablyChannel";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register workflow routes
app.use("/api/stt", sttRouter);
app.use("/api/translate", translateRouter);
app.use("/api/tts", ttsRouter);

// Register access code routes
app.use("/api/access", accessRouter);
app.use("/api/ably-access", ablyAccessRouter);
app.use("/api/ably-channel", ablyChannelRouter);

// Add any other middleware or error handlers here

export default app;
