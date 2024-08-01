const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/index");
const clothingItemRouter = require("./routes/index");

mongoose.set("strictQuery", true);

const app = express();
const { PORT = 3001 } = process.env;

// Connecting to the database
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: "66aadcb96843544e5458ea87", // paste the _id of the test user created in the previous step
  };
  next();
});

app.use("/", userRouter);
app.use("/", clothingItemRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
