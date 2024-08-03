const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");

mongoose.set("strictQuery", true);

const app = express();
app.use(cors());
const { PORT = 3001 } = process.env;

// Connecting to the database
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {})
  .catch(console.error);

const routes = require("./routes");

app.use(express.json());

app.use("/", mainRouter);

app.listen(PORT, () => {});
