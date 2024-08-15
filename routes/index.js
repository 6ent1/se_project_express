const router = require("express").Router();
const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");
// const { ERROR_CODES, ERROR_MESSAGES } = require("../utils/errors");
const { login, createUser } = require("../controllers/users");
const {
  validateLogin,
  validateCreateUser,
} = require("../middlewares/validation");
const NotFoundError = require("../utils/errors/NotFoundError");

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);
router.post("/signin", validateLogin, login);
router.post("/signup", validateCreateUser, createUser);

router.use((req, res, next) => {
  // res.status(ERROR_CODES.NOT_FOUND).send({ message: ERROR_MESSAGES.NOT_FOUND });
  next(new NotFoundError("Route not found"));
});

module.exports = router;
