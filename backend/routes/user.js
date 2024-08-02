const express = require("express");
const app = express();
const zod = require("zod");
const jwtsecret = require("../config");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Account } = require("../db");
const bodyParser = require("body-parser");
const { authmiddleware } = require("../middleware");

const Sighnupschema = zod.object({
  username: zod.string(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

router.post("/signup", async (req, res) => {
  const body = req.body;
  const success = await Sighnupschema.safeParse(body);

  if (!success) {
    return res.json({
      message: "Incorrect inputs/Invalid email",
    });
  }
  const existuser = await User.findOne({
    username: body.username,
  });

  if (existuser) {
    return res.json({
      message: "Incorrect inputs/Invalid email",
    });
  }

  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  const userId = user._id;

  await Account.create({
    userId,
    // balance: 1 + Math.random() * 10000,
    balance:Math.floor(Math.random()*(10000-1000)+1000).toFixed(2)
  });

  const token = jwt.sign(
    {
      userId: User._id,
    },
    jwtsecret
  );
  res.json({
    message: "User created Succesfully",
    jwt: token,
  });
});

const SigninSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
});

router.get("/getuserid",authmiddleware,(req,res)=>{
  return res.json({
    userid:req.userId
  })
})

router.post("/signin", async (req, res) => {
  const body = req.body;
  const success = await SigninSchema.safeParse(body);
  if (!success) {
    return res.json({
      message: "Incorrect inputs/Invalid email",
    });
  }
  const user = await User.findOne({
    username: body.username,
    password:body.password
  });
  if (!user) {
    return res.status(411).json({
      message: "Error while logging in",
    });
  }

  const token = jwt.sign({ userid: user._id }, jwtsecret);
  res.status(200).send({
    jwt: token,
  });
});

const UpdateSchema = zod.object({
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

router.put("/", async (req, res) => {
  const body = req.body;
  const success = await UpdateSchema.safeParse(body);
  if (!success) {
    return res.json({
      message: "Incorrect inputs/Invalid email",
    });
  }
  const user = await User.findOne({
    username: body.username,
  });

  if (!user) {
    return res.json({
      message: "Incorrect inputs/Invalid email",
    });
  }

  await User.updateOne(
    {
      username: body.username,
    },
    {
      $set: {
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
      },
    }
  );

  res.status(200).json({
    message: "Updated successfully",
  });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter;

  const arr = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  return res.send(arr);
});

module.exports = router;
