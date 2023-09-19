const { genSalt } = require("bcrypt");
const User = require("./../models/UsersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail } = require("../utils/mailer");
const path = require("path");
const mongoose = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

function validateVariable(variable) {
  return typeof variable !== "undefined";
}

// handle post requests at "api/users/register"
exports.createUser = async (req, res) => {
  try {
    // create a new user after validating and sanitzing
    const { password, verifyPassword, username, email,orderEmailorId } = req.body;


    console.log("register request", req.body, username);


    const orderEmailExists = User.findOne({order_email:orderEmailorId})
    const idExists = User.findOne({user_id:orderEmailorId})

    // if ( username || password ) this is wrong, it'll be true if any one of them is containing a value
    if (orderEmailExists||idExists) {
      if (
        validateVariable(username) &&
        validateVariable(password) &&
        validateVariable(email)
      ) {
        const usernameExist = await User.findOne({ username: username });
        const emailExist = await User.findOne({ email });
  
        console.log(usernameExist, emailExist, "love");
  
        if (usernameExist) {
          res.status(400).json({
            message: `username already exists ${username}`,
            usernameExist,
          });
        } else if (emailExist) {
          res
            .status(400)
            .json({ message: `email already exists ${email}`, emailExist });
        } else {
          if (password == verifyPassword) {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);


            const user =  User.findOneAndUpdate({user_id:orderEmailorId},{
              password: hashedPassword,
              username: username,
              email: email,
              resgistered:true
            });
            try {
              const id = user._id;
              const username = user.userName;
              console.log("saved");
              const token = jwt.sign({ id, username }, process.env.JWT_SECRET, {
                expiresIn: "30m",
              });
              console.log("token ");
              // user.save(user);
  
              // sendVerificationEmail(email, token);
              return res
                .status(201)
                .json({ message: "user registered sucessfully", id: user._id });
            } catch (error) {
              console.log(error);
              return res
                .status(400)
                .json({ message: "user could not be registered", error: error });
            }
          } else {
            res.status(401).json({
              message: "password and confirm password field don't match",
            });
          }
        }
      } else {
        res.status(400).json({ message: "fill in required fields" });
      }
    } else {
      res.status(400).json({ message: "Card order credentials are incorrect" });
    }

  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
};

// handle POST request at "api/users/login"
exports.login = async (req, res) => {
  const userInfo = req.body;
  const { emailOrUsername, password } = userInfo;
  try {
    const user =
      (await User.findOne({ username: emailOrUsername })) ||
      (await User.findOne({ email: emailOrUsername }));
    if (user) {
      comparePassword(user);
    } else {
      res.status(400).json({ message: "user does not exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "something went wrong", error });
  }
  // compare the encrypted password with one the user provided
  function comparePassword(user) {
    bcrypt.compare(password, user.password).then((isMatch) => {
      // if the password doesn't match, return a message
      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid password",
        });
        // if it matches generate a new token and send everything is json
      } else {
        generateNewToken(user);
      }
    });
  }

  // generate new token with the new data
  function generateNewToken(user) {
    jwt.sign(
      {
        id: user._id,
        username: user.userName,
      },
      jwtSecret,
      { expiresIn: "3d" },
      (err, token) => {
        console.log(user, "user");
        if (err) {
          console.log(err);
          res.json({ err });
        } else {
          res.status(200).json({
            token,
            message: "Logged in Succefully",
            user,
          });
        }
      }
    );
  }
};

exports.createProfile = async (req, res) => {
  const { id } = req.user;
  const { address, about, firstName, lastName } = req.body;

  try {
    await User.findById(req.user.id, async (err, userToUpdate) => {
      if (err) {
        res
          .status(400)
          .json({ message: "Error getting user. Please try again." });
      } else {
        // Create user profile
        let updatedUser = {
          firstName: req.body.firstName
            ? req.body.firstName
            : userToUpdate.firstName,
          lastName: req.body.lastName
            ? req.body.lastName
            : userToUpdate.lastName,
          about: about ? about : userToUpdate.about,
          address: address ? address : userToUpdate.address,
          profileCreated: true,
        };

        User.findByIdAndUpdate(req.user.id, updatedUser, {
          new: true,
          useFindAndModify: false,
        })
          .select("-password")
          .then((user) => {
            res.status(200).json({
              message: "Account updated",
              user,
            });
          })
          .catch((err) => {
            res.status(400).json({ message: "Couldn't update", err });
          });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "profile created" });
  }
};

// handle get request at "/api/users/user"
exports.getUser = (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) => res.status(200).json({ user: user, message: "user found" }))
    .catch((err) => {
      res.status(500).json({ error: err, message: "user not found" });
    });
};

// handle get request at "/api/users/user"
exports.getUserProfile = (req, res) => {
  User.findOne({user_id:req.params.id})
    .select("-password")
    .then((user) => res.status(200).json({ user: user, message: "user found" }))
    .catch((err) => {
      res.status(500).json({ error: err, message: "user not found" });
    });
};

// handle get request at "/api/users/user"
exports.getUsers = (req, res) => {
  User.find()
    .select("-password")
    .then((user) => res.json({ users: user, message: "request sucessful" }));
};

// handle get request at "/api/users/user"
exports.getRestrictedUsers = (req, res) => {
  User.find({ isRestricted: true })
    .select("-password")
    .then((user) => res.json({ users: user, message: "request sucessful" }));
};

// handle PUT at api/users/edit_account to edit user data
exports.editUser = async (req, res) => {
  await User.findById(req.user.id, async (err, userToUpdate) => {
    if (err) {
      res
        .status(400)
        .json({ message: "Error getting user. Please try again." });
    } else {
      // Create user with the new data
      let updatedUser = {
        firstName: req.body.firstName
          ? req.body.firstName
          : userToUpdate.firstName,
        lastName: req.body.lastName ? req.body.lastName : userToUpdate.lastName,
        email: req.body.email ? req.body.email : userToUpdate.email,
        about: req.body.about ? req.body.about : userToUpdate.about,
        workPhone: req.body.workPhone
          ? req.body.workPhone
          : userToUpdate.workPhone,
        phone: req.body.phone ? req.body.phone : userToUpdate.phone,
        job: {
          title: req.body.title ? req.body.title : userToUpdate.job.title,
          role: req.body.role ? req.body.role : userToUpdate.job.role,
          organization: req.body.organization
            ? req.body.organization
            : userToUpdate.job.organization,
          description: req.body.description
            ? req.body.description
            : userToUpdate.job.description,
        },
        address: {
          city: req.body.city ? req.body.city : userToUpdate.address.city,
          address: req.body.address
            ? req.body.address
            : userToUpdate.address.address,
          state: req.body.state ? req.body.state : userToUpdate.address.state,
          postalCode: req.body.postalCode
            ? req.body.postalCode
            : userToUpdate.address.postalCode,
          country: req.body.country
            ? req.body.country
            : userToUpdate.address.country,
        },
        username: req.body.username ? req.body.username : userToUpdate.username,
      };

      console.log(req.body, "body");

      // Check if the Username is already taken in case we want to edit it
      // Throw a message to the user if so
      await User.findOne(
        { username: req.body.username },
        (err, userWithSameUsername) => {
          if (err) {
            res.status(400).json({ message: "Error getting username" });
          } else if (userWithSameUsername) {
            res.status(400).json({ message: "Username is taken" });
          } else {
            User.findByIdAndUpdate(req.user.id, updatedUser, {
              new: true,
              useFindAndModify: false,
            })
              .select("-password")
              .then((user) => {
                res.status(200).json({
                  message: "Account settings updated",
                  user,
                });
              })
              .catch((err) => {
                res.status(400).json({ message: "Couldn't update", err });
              });
          }
        }
      );
    }
  });
};

//upload avatar
exports.createAvatar = async (req, res) => {
  if (req.file) {
    const { id } = req.user;
    console.log(req.file);
    try {
      await User.findByIdAndUpdate(
        id,
        {
          $set: {
            avatar: path.join(req.file.path),
          },
        },
        { new: true }
      );
      res
        .status(201)
        .json({ msg: "avatar created successfully", path: req.file.path });
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json({ msg: "avatar creation is not successful", error: error });
    }
  } else {
    res.status(400).json({ msg: "error" });
  }
};

//upload user Images
exports.uploadImages = async function (req, res) {
  try {
    const { id } = req.user;

    await req?.files?.map(async (file) => {
      const newImage = { url: file.path, id: new mongoose.Types.ObjectId() };

      console.log(newImage);
      const user = await User.findByIdAndUpdate(id, {
        $push: { userImages: newImage },
      });
    });

    return res.status(201).json({ message: "Image(s) uploaded sucessfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Image(s) not uploaded sucessfully", error });
  }
};

//delete user Images
exports.deleteUserImage = function (req, res) {
  const { id } = req.body;

  const { imageId } = req.params;
  console.log(imageId);
  try {
    User.updateOne(
      { _id: id },
      { $pull: { userImages: { _id: mongoose.Types.ObjectId(imageId) } } }
    ).then((user) => {
      return res.status(201).json({ message: "Image(s) deleted sucessfully" });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Image(s) not deleted sucessfully" });
  }
};

// this function is called after token has been verified
exports.verifyToken = async (req, res) => {
  res.status(200).json({ message: "token verified" });
};

exports.socialPlatforms = async (req, res) => {
  const { id } = req.user;
  const { name, link } = req.body;
  console.log(name, link);

  try {
    const existingPlatforms = await User.findOne({ _id: id }).select("links");
    const platformExists = existingPlatforms?.links.find(
      (platform) => platform.name === name
    );

    if (platformExists) {
      const updatedPlatforms = existingPlatforms.links.map(
        (platform) => {
          if (platform.name === name) {
            return { ...platform, link: link };
          }
          return platform;
        }
      );

      const user = await User.findByIdAndUpdate(
        id,
        { links: updatedPlatforms },
        { new: true }
      ).exec();

      if (user) {
        res.status(201).json({ message: "Social platforms updated" });
      } else {
        res.status(400).json({ message: "user not found" });
      }
    } else {
      const user = await User.findByIdAndUpdate(id, {
        $push: { links: { name: name, link: link } },
      }).exec();

      if (user) {
        res.status(201).json({ message: "Social platforms updated" });
      } else {
        res.status(400).json({ message: "user not found" });
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "error: Social platforms not updated", error });
  }
};

exports.removePlatformByName = async (req, res) => {
  const { id } = req.user;
  const { name } = req.params;

  try {
    const user = await User.findOne({ user: id });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const existingPlatforms = user.socialPlatforms;
    const platformIndex = existingPlatforms.findIndex(
      (platform) => platform.name === name
    );

    if (platformIndex === -1) {
      return res.status(404).json({ message: "Platform not found" });
    }

    existingPlatforms.splice(platformIndex, 1);

    await user.save();

    res.status(200).json({ message: "Platform removed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error: Platform not removed", error });
  }
};
// to delete user has to verify their identity by sign
const deleteAccount = async (req, res) => {
  const userInfo = req.body;
  const { emailOrId, password } = userInfo;
  if (emailOrId && password) {
    try {
      // check if user exists
      const user =
        (await User.findOne({ username: emailOrId })) ||
        (await User.findOne({ email: emailOrId }));

      if (user) {
        // console.log(user);
        // verify password
        const userValid = await bcrypt.compare(password, user.password);
        if (userValid) {
          await User.findByIdAndDelete(user._id);
          return res.status(201).json({
            message: "user deleted",
          });
        } else {
          return res.status(401).json({ message: "password incorrect" });
        }
      } else {
        res.status(404).json({ message: " email or user ID is wrong" });
      }
    } catch (error) {
      return res.status(404).json({
        message: "something went wrong: account could not be deleted",
        error,
      });
    }
  } else {
    res.status(401).json({ message: "fill out the necessary fields" });
  }
};

// to get password link
const forgotPasswordLink = async (req, res) => {
  const { email } = req.body;
  if (email) {
    try {
      const user = await User.find({ email: email });
      if (user) {
        const token = jwt.sign({ email }, jwtSecret, {
          expiresIn: "30m",
        });
        sendResetPasswordEmail(email, token);
        res.status(200).json({ message: "success" });
      } else {
        res.status(400).json({ message: "user not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "something went wrong", error });
    }
  } else {
    res.status(400).json({ message: "no email in request body" });
  }
};

//updates the password to the new password
const resetPassword = async (req, res) => {
  const { id } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(id);
    if (user) {
      // console.log(user);
      const userValid = await bcrypt.compare(oldPassword, user.password);
      if (userValid) {
        const salt = await genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(id, {
          password: hashedPassword,
        });
        return res.status(201).json({
          message: "Password changed sucessfully",
        });
      } else {
        return res.status(400).json({ message: "old password incorrect" });
      }
    }
    res.status(400).json({ message: "user not found" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "error: could not change password", error });
  }
};

//change password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, verifyPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (user) {
      // console.log(user);
      const userValid = await bcrypt.compare(oldPassword, user.password);
      if (userValid) {
        const salt = await genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        if (newPassword === verifyPassword) {
          try {
            await User.findByIdAndUpdate(req.user.id, {
              password: hashedPassword,
            });
            return res.status(201).json({
              message: "Password changed sucessfully",
            });
          } catch (error) {
            return res.status(500).json({
              message: "error: Password could not be changed sucessfully",
            });
          }
        } else {
          res.status(400).json({
            message: "error: Passwords do not match",
          });
        }
      } else {
        return res.status(400).json({ message: "old password incorrect" });
      }
    } else {
      res.status(400).json({ message: "user not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "error: could not change password", error });
  }
};
