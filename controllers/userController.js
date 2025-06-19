import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError";
import { User } from "../models/userModel.js";


export const register = catchAsyncError(async (req , res ,next) => {
    try{
        const {name , email , phone , password , verificationMethod} = req.body;
        if(!name || !email || !phone || !password || !verificationMethod){
            return next(new ErrorHandler("All fields are required" , 400));
        }

        function validatePhoneNumber(phone){
            const phoneRegex = /^+913\d{9}/;
            return phoneRegex.test(phone);
        }

        if(!validatePhoneNumber){
            return next(new ErrorHandler("Invalid phone number" , 400));
        }

        const existingUser = await User.findOne({
            $or : [
                {
                    email,
                    accountVerified: true,
                },
                {
                    phone,
                    accountVerified: true,
                }
            ]
        });

        if(existingUser){
            return next(new ErrorHandler("phone or email is already exist" , 400));
        }

        const registerationAttemptsByUser = await User.find({
            $or: [
                {phone, accountVerified:false},
                {email, accountVerified:false}
            ]
        });

        if(registerationAttemptsByUser > 3){
            return next(new ErrorHandler(
                "you have exceed the maximum number of attempts (3). please try again an hour.",
                400
            ))
        }

    }catch (error) {

    }
})
