const express = require('express');
const route = express.Router();
const {deleteAccount, suspendAccount, activateAccount, banAccount, adminSignIn, adminSignup, verifyToken, markNfc} = require('../../controllers/adminController');
const { getUsers } = require('../../controllers/userController');
const { adminAuthMiddleware } = require('../../middlewares/auth');

// account

route.post("/signin",adminSignIn);
route.get("/accounts",getUsers);
route.post("/signup",adminSignup);
route.delete("/account/:userId", deleteAccount);
route.put("/account/suspend/:userId", suspendAccount);
route.put("/account/activate/:userId", activateAccount);
route.put("/account/mark_url/:userId", markNfc);
route.put("/account/ban/:userId", banAccount);
route.get("/verifyToken", adminAuthMiddleware, verifyToken);

module.exports = route;