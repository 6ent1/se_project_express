const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const errorMessages = require("../utils/errors");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(errorMessages.AUTHENTICATION_ERROR)
      .send({ message: errorMessages.AuthenticationError });
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // Add the payload to the request object
    next(); // Pass the request to the next middleware or route handler
  } catch (err) {
    console.error(err);
    return res
      .status(errorMessages.AUTHENTICATION_ERROR)
      .send({ message: errorMessages.AuthenticationError });
  }

  return null;
};

module.exports = auth;
