const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ERROR_CODES, ERROR_MESSAGES } = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const NotFoundError = require("../utils/errors/NotFoundError");
const BadRequestError = require("../utils/errors/BadRequestError");
const ConflictError = require("../utils/errors/ConflictError");
const UnauthorizedError = require("../utils/errors/UnauthorizedError");

const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found");
        // return res
        //   .status(ERROR_CODES.NOT_FOUND)
        //   .send({ message: ERROR_MESSAGES.NOT_FOUND });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError(err.message));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  // if (!email) {
  //   return res
  //     .status(ERROR_CODES.BAD_REQUEST)
  //     .send({ message: ERROR_MESSAGES.BAD_REQUEST });
  // }

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        throw new ConflictError("A user with this email already exists");
      }

      return bcrypt.hash(password, 10).then((hashedPassword) => {
        if (!hashedPassword) {
          throw new Error("Password hashing failed");
        }

        return User.create({ name, avatar, email, password: hashedPassword });
      });
    })
    .then((user) =>
      res
        .status(200)
        .send({ name: user.name, avatar: user.avatar, email: user.email })
    )
    .catch((err) => {
      if (err.name === "ValidationError" || !email) {
        next(new BadRequestError("Invalid data provided"));
      } else if (err.code === 11000 || err.name === "ConflictError") {
        next(new ConflictError("A user with this email already exists"));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found");
      }
      res.status(200).send(user);
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  // if (!email || !password) {
  //   return res
  //     .status(ERROR_CODES.BAD_REQUEST)
  //     .send({ message: ERROR_MESSAGES.BAD_REQUEST });
  // }

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({ token });
    })
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        next(new UnauthorizedError("Incorrect email or password"));
      } else if (!email || !password) {
        next(new BadRequestError("Missing email or password"));
      } else {
        next(err);
      }
    });
};

module.exports = { createUser, getCurrentUser, updateUser, login };
