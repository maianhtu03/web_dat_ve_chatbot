const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

// Route xử lý chat
router.post("/ask", chatbotController.handleChat);

module.exports = router;