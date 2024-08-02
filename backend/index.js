

const express = require("express");
const mainRouter = require("../backend/routes/index"); // Ensure this path is correct
const userRouter = require("../backend/routes/user");
const accountRouter=require("../backend/routes/account") // Assuming you have a userRouter file
const app = express();
const cors = require("cors");


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/v1/account",accountRouter);
app.use("/api/v1", mainRouter);
app.use("/api/v1/users", userRouter);


// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
