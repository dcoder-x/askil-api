const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const users_controller = require("./../../controllers/userController");
const users_validation = require("../../middlewares/validation/validateUser");
const { singleMulterImageHandler, multipleMulterImageHandler, singleImage, multipleImages } = require("../../middlewares/handleImageMulter");

// @route   POST api/users/signup
// @desc    send user data for registeration
// @access  public
router.post("/register", users_controller.createUser);

// @route   POST api/users/login
// @desc    send user data for logging in
// @access  public
router.post("/login", users_controller.login);


// users_validation.validateLogin,
// @route   POST api/users/create_profile
// @desc    Post user data
// @access  private
router.post("/create_profile",auth, users_controller.createProfile);


// users_validation.validateLogin,
// @route   POST api/users/create_profile
// @desc    Post user data
// @access  private
router.post("/update_profile",auth, users_controller.editUser);

// users_validation.validateLogin,
// @route   POST api/users/create_avatar
// @desc    Post user image
// @access  private
router.post("/create_avatar",auth,singleImage, users_controller.createAvatar);

// users_validation.validateLogin,
// @route   POST api/users/upload_images
// @desc    Post user images
// @access  private
router.post("/upload_images",auth,multipleImages, users_controller.uploadImages);

// users_validation.validateLogin,
// @route   PUT api/users/upload_images
// @desc    PUT delete images
// @access  private
router.put("/delete_images/:imageId",auth, users_controller.deleteUserImage);


// users_validation.validateLogin,
// @route   GET api/users/user
// @desc    Get user data
// @access  private
router.get("/user", auth, users_controller.getUser);

// users_validation.validateLogin,
// @route   GET api/users/user
// @desc    Get user data
// @access  private
router.post("/social", auth, users_controller.socialPlatforms);

// users_validation.validateLogin,
// @route   GET api/users/user
// @desc    Get user data
// @access  private
router.post("/remove_social/:name", auth, users_controller.removePlatformByName);

// @route   PUT api/users/edit_account
// @desc    Edit user data
// @access  private
router.put(
  "/edit_account",
  auth,
  // users_validation.validateEditUser,
  users_controller.editUser
);

// @route   PUT api/users/edit_account
// @desc    Edit user data
// @access  private
router.put(
  "/change_password",
  auth,
  // users_validation.validateEditUser,
  users_controller.changePassword
);
//verify user token
router.get('/verifyToken',auth,users_controller.verifyToken)

module.exports = router;
