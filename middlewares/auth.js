const jwt = require("jsonwebtoken");
const { sendSellerVerificationEmail } = require("../utils/mailer");

const jwtSecret = process.env.JWT_SECRET;




/**
 * this method to fetch the token from the frontend
 * the token will be attached to the header
 * and if it's availble we attach the token to the req.user
 */
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  console.log(token)

  // check for token
  if (!token)
    return res
      .status(403)
      .json({ message: "Authorization denied, please login" });

  try {
    //verify token
    const decoded = jwt.verify(token, jwtSecret);

    // add user from token payload which contains the user id we attached to the token
    req.user = decoded;

    // restrict all permissions from the restricted users
    if (req.user.isRestricted) {
      res.status(401).json({ message: "Your account is banned, contact us" });
    } else next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Session Expired",
        error: error.message,
      });
    }
    if (error instanceof jwt.JsonWebTokenError ) {
      return res.status(401).json({
        message: "Invalid Token",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Internal server Error",
      error: error.message,
      stack: error.stack,
    });
  }
};

const adminAuthMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({
      message: "No Authorization Header",
    });
  }
  const token = authorization.split("Bearer ")[1];

  try {
    if (!token) {
      return res.status(401).json({
        message: "Invalid Token Format",
      });
    }
    const decode = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    console.log('admin token verified')
    req.admin = decode;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Session Expired",
        error: error.message,
      });
    }
    if (error instanceof jwt.JsonWebTokenError || error instanceof TokenError) {
        console.log(process.env.SECRET_KEY)
      return res.status(401).json({
        message: "Invalid Token",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Internal server Error",
      error: error.message,
      stack: error.stack,
    });
  }
};


async function   verifyUserEmail (req,res,next) {
  const {token} = req.query;
  try {
      if (!token) {
          return res.status(401).json({
              message: 'Invalid Token Format or no token found'
          })
      }
      console.log(SECRET_KEY)

      jwt.verify(token, SECRET_KEY);
      const payload=jwt.decode(token)
      await User.findOneAndUpdate({_id:payload.id},{email_verified:true},{new:true})
      res.redirect(`https://christianreal.onrender.com/profile/?id=${payload.id}`)
      next()
  } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
          return res.status(401).json({
              message: 'Session Expired',
              error: error.message,
          })
      }
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenError) {
          return res.status(401).json({
              message: 'Invalid Token',
              error: error.message,
          })
      }
      res.status(500).json({
          message: 'Internal server Error',
          error: error.message,
          stack: error.stack
      });
  }
}

module.exports = { auth,verifyUserEmail,adminAuthMiddleware};
