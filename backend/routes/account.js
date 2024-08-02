const express = require("express");
const router = express.Router();
const { Account, User } = require("../db");
const zod = require("zod");
const { default: mongoose } = require("mongoose");
const { authmiddleware } = require("../middleware");
router.get("/balance", async (req, res) => {
  const id = req.query.id;

  const bal = await Account.findOne({ userId: id });

  res.status(200).json({
    balance: bal.balance,
  });
});

const accountTransferschema = zod.object({
  to: zod.string(),
  amount: zod.number(),
});
router.post("/transfer",async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  const id = req.query.id;
  const body = req.body;
  const success = accountTransferschema.safeParse(body);
  if (!success) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid type",
    });
  }

  const fromUser = await Account.findOne({ userId: id }).session(session);
  if (!fromUser) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const toUser = await Account.findOne({ userId: body.to }).session(session);
  if (!fromUser) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  if (body.amount > fromUser.balance) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }

  const frombalance = parseInt(fromUser.balance) - parseInt(body.amount);
  await Account.updateOne({ userId: id }, { balance: frombalance }).session(
    session
  );

  const tobalance = parseInt(toUser.balance) + parseInt(body.amount);
  await Account.updateOne({ userId: body.to }, { balance: tobalance }).session(
    session
  );

  session.commitTransaction();

  res.status(200).json({
    message: "Transfer successful",
  });
});
module.exports = router;
