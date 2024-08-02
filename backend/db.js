const mongoose = require("mongoose");
const signupRouter = require("../backend/routes/user"); // Adjust the path as needed

mongoose.connect(
  "mongodb+srv://saieshwar:root@cluster0.taogvs7.mongodb.net/paytm",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  }
);

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
});

const User = mongoose.model("User", userSchema);


const accountSchema=mongoose.Schema({
    userId:{
        // type:mongoose.Schema.Types.ObjectId,
        type:String,
        ref:'User'
    },
    balance:{
        type:Number
    }
}
)

const Account=mongoose.model('Account',accountSchema)
module.exports = {
  User,Account
};
