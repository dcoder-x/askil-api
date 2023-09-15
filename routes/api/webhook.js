const express = require("express");
const { webhook } = require("../../controllers/webhook");
const router = express.Router();

// @route   POST api/webhook/transaction
// @desc    send user data for registeration
// @access  public
router.post("/transaction", webhook);