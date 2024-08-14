const router = require("express").Router();
const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");
const { ERROR_CODES, ERROR_MESSAGES } = require("../utils/errors");
const { login, createUser } = require("../controllers/users");
const NotFoundError = require("../utils/errors/NotFoundError");

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);
router.post("/signin", login);
router.post("/signup", createUser);

router.use((req, res) => {
  // res.status(ERROR_CODES.NOT_FOUND).send({ message: ERROR_MESSAGES.NOT_FOUND });
  next(new NotFoundError("Route not found"));
});

module.exports = router;
