const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ERROR_CODES, ERROR_MESSAGES } = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");

const updateUser = (req, res) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) {
        return res
          .status(ERROR_CODES.NOT_FOUND)
          .send({ message: ERROR_MESSAGES.NOT_FOUND });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res
          .status(ERROR_CODES.BAD_REQUEST)
          .send({ message: ERROR_MESSAGES.BAD_REQUEST });
      }
      return res
        .status(ERROR_CODES.SERVER_ERROR)
        .send({ message: ERROR_MESSAGES.SERVER_ERROR });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email) {
    return res
      .status(ERROR_CODES.BAD_REQUEST)
      .send({ message: ERROR_MESSAGES.BAD_REQUEST });
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(ERROR_CODES.DUPLICATE_EMAIL)
          .send({ message: ERROR_MESSAGES.ExistingUser });
      }

      return bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          if (!hashedPassword) {
            throw new Error("Password hashing failed");
          }

          return User.create({ name, avatar, email, password: hashedPassword });
        })
        .then((user) =>
          res
            .status(200)
            .send({ name: user.name, avatar: user.avatar, email: user.email })
        );
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res
          .status(ERROR_CODES.BAD_REQUEST)
          .send({ message: ERROR_MESSAGES.BAD_REQUEST });
      }
      if (err.code === 11000) {
        return res
          .status(ERROR_CODES.DUPLICATE_EMAIL)
          .send({ message: ERROR_MESSAGES.ExistingUser });
      }

      return res
        .status(ERROR_CODES.SERVER_ERROR)
        .send({ message: ERROR_MESSAGES.SERVER_ERROR });
    });
};

const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return res
          .status(ERROR_CODES.NOT_FOUND)
          .send({ message: ERROR_MESSAGES.NOT_FOUND });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(ERROR_CODES.SERVER_ERROR)
        .send({ message: ERROR_MESSAGES.ServerError });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(ERROR_CODES.BAD_REQUEST)
      .send({ message: ERROR_MESSAGES.BAD_REQUEST });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        return res
          .status(ERROR_CODES.AUTHENTICATION_ERROR)
          .send({ message: ERROR_MESSAGES.AuthenticationError });
      }

      return res
        .status(ERROR_CODES.SERVER_ERROR)
        .send({ message: ERROR_MESSAGES.SERVER_ERROR });
    });
};

module.exports = { createUser, getCurrentUser, updateUser, login };
