const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");
const cors = require("cors");
const { login, createUser } = require("./controllers/users");

mongoose.set("strictQuery", true);

const app = express();
app.use(cors());
const { PORT = 3001 } = process.env;

// Connecting to the database
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

const routes = require("./routes");
app.use(express.json());

app.post("/signin", login);
app.post("/signup", createUser);

app.use(routes);
app.use("/", mainRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
