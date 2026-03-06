const router = require("express").Router();
const authGuard = require("../middleware/auth");
const agoraController = require("../controllers/agora/agoraController");

// Generate Agora token
router.post("/generate-call-token", authGuard, (req, res) =>
  agoraController.generateToken(req, res)
);

// Initiate a call
router.post("/initiate-call", authGuard, (req, res) => agoraController.initiateCall(req, res));

// Answer a call
router.post("/answer-call/:callId", authGuard, (req, res) => agoraController.answerCall(req, res));

// Decline a call
router.post("/decline-call/:callId", authGuard, (req, res) =>
  agoraController.declineCall(req, res)
);

// End a call
router.post("/end-call/:callId", authGuard, (req, res) => agoraController.endCall(req, res));

// Get call info
router.get("/call/:callId", authGuard, (req, res) => agoraController.getCall(req, res));

// Get call history
router.get("/call-history/:userId", authGuard, (req, res) =>
  agoraController.getCallHistory(req, res)
);

// Save call history to database
router.post("/save-call-history", authGuard, (req, res) =>
  agoraController.saveCallHistory(req, res)
);

// Get user's call history from database (paginated)
router.get("/user-call-history/:userId", authGuard, (req, res) =>
  agoraController.getUserCallHistory(req, res)
);

module.exports = router;
