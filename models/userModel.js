import mongoose  from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : {
        type : String,
        minLength : [6, "password must have at least 6 charactrers "],
        maxLength : [12, "password cannot have more than 12 charactrers "]
    },
    phone : String,
    accountVerified : {type : Boolean ,  default : false},
    verificationCode : Number,
    verificationCodeExpire : Date,
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    createdAt: {
        type : Date,
        default : Date.now
    },
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password , 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword , this.password);
};

export const User = mongoose.model("User" , userSchema);
