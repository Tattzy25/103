import express, { Request, Response } from "express";

const router = express.Router();

// In-memory storage for solo mode results (in production, use Redis or database)
const soloResults = new Map<string, any>();

// GET /solo-result/:sessionId - Get processing result for solo mode
router.get("/solo-result/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required." });
    }

    const result = soloResults.get(sessionId);
    
    if (!result) {
      return res.json({
        sessionId,
        processingComplete: false,
        message: "Processing in progress..."
      });
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Solo result fetch error:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to fetch solo result",
      processingComplete: false
    });
  }
});

// POST /solo-result/:sessionId - Store processing result for solo mode (internal use)
router.post("/solo-result/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const resultData = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required." });
    }

    // Store the result
    soloResults.set(sessionId, {
      sessionId,
      ...resultData,
      processingComplete: true,
      timestamp: new Date().toISOString()
    });

    console.log(`Solo result stored for session ${sessionId}`);

    // Clean up old results (optional - prevent memory leaks)
    setTimeout(() => {
      soloResults.delete(sessionId);
      console.log(`Cleaned up solo result for session ${sessionId}`);
    }, 300000); // 5 minutes

    return res.json({ success: true, message: "Result stored successfully" });
  } catch (error: any) {
    console.error("Solo result storage error:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to store solo result"
    });
  }
});

export default router;
export { soloResults };
