const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");
const { requestLogger, errorLogger } = require("./middlewares/logger");
require("dotenv").config();
const { errors } = require("celebrate");
mongoose.set("strictQuery", true);

const errorHandler = require("./middlewares/error-handler");
const app = express();
app.use(cors());
const { PORT = 3001 } = process.env;

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

// Connecting to the database
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {})
  .catch(console.error);

app.use(express.json());

app.use(requestLogger);
app.use("/", mainRouter);

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
