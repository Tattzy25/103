⚡️ BRIDGIT-AI — PRODUCTION RULES
If you don’t know something, don’t guess.
If you can’t deliver production-ready work, stop immediately.
No lies. No guesses. No half-finished garbage.
This project is zero tolerance for placeholders, fake screens, or toy code — unless it’s an intentional image placeholder, that’s it.

Do not:

Touch anything you weren’t told to touch.

Add stuff nobody asked for.

Remove parts you don’t fully own.

Follow instructions. Build exactly what’s specified. Nothing more, nothing less.

The following will be Voice workflow lineup.     1. **Recording to STT**: The recorded audio goes directly to the STT service for transcription.

2. **STT to Message Queue**: The STT output (text) goes to the message queue.

3. **Message Queue to DeepL**: The DeepL service retrieves the text from the message queue and translates it.

4. **DeepL to Message Queue**: The translated text goes back to the message queue.

5. **Message Queue to Eleven Labs**: The Eleven Labs service retrieves the translated text from the message queue and synthesizes it.

6. **Eleven Labs to Message Queue**: The synthesized audio goes back to the message queue.

7. **Message Queue to Voice ID**: The Voice ID service retrieves the synthesized audio from the message queue and generates a voice ID.

8. **Voice ID to Message Queue**: The voice ID goes back to the message queue.

9. **Message Queue to Ably**: The final output is sent to Ably.

Connected user’s client receives it real-time, plays back in their language.

If the user is on solo mode.Everything stays the same except.The playback will be on the user's device, it will not send.To ably.

User keeps talking → same cycle: Mic → STT → upstash message queue → Translate DEEP L → upstash message queue →  TTS → upstash message queue →  Ably → upstash message queue →  Output → Repeat.

✅ No dead ends. No guesswork. One single chain.

⚡️ If anything’s unclear — you ASK.
If you hit a wall — you STOP.
If you can’t handle the chain exactly as written — you DON’T SHIP IT.

Bridgit-AI runs tight or doesn’t run at all.
Crystal. Bright. No excuses.

✅ Now build.

Please confirm that you have read and understand every single line in here. 

please make sure we are always on the correct directory 

## Code Integrity & Maintenance
While an AI cannot technically "lock" the codebase, maintaining code integrity is paramount. To ensure the stability and quality of this production-grade system, the following practices are adhered to:
- **Strict Adherence to Specifications:** All development strictly follows the provided voice flow and production rules.
- **No Unrequested Changes:** No code outside the scope of the current task will be touched.
- **Production-Ready Output:** All delivered code is fully functional, uses real data (no mockups or dummy text), and is suitable for immediate deployment.
- **Clear Documentation:** This README will be kept up-to-date with critical configuration details and known issues to facilitate future maintenance and prevent unintended modifications.

***** VERY IMPORTANT *****

ALL CODE ALL UPDATES ALL ANYTHING DONE NEEDS TO BE ONLY 

✅ “Deployable with REAL data, NO mockups, NO dummy text — all output must be operational and authentic, suitable for immediate launch and real user interaction.”


✅ “Zero placeholders. Zero lorem ipsum. Real code, real structure, real connections. If it’s fake, scrap it.”


✅ “Full-stack deployable — NO FAKE SHIT — real endpoints, real DB schema, real UX. Not a sample. Not a prototype. Live-grade only.”



“Deployable” → it must run, not sit on a shelf.

“Fully functional” → it must work end-to-end.

“Zero placeholders” → no dummy junk.

“Production-grade” → the classic, but reinforce it with above.

“Authentic data” → forces real examples (e.g. real product schemas).

“Operational now” → it must run today, not someday.