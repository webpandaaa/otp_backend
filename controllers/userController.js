import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";


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

        const userData = {
            name, email, phone, password
        }

        const user =  await User.create(userData);
        const verificationCode = await user.generateVerificationCode();
        await user.save();
        sendVerificationCode(verificationMethod,verificationCode, email,phone);
        res.status(200).json({
            success : true,
        });

    }catch (error) {
        next(error); 
    }
})

async function sendVerificationCode(verificationMethod,verificationCode, email, phone){
    if(verificationMethod === "email"){
        const message = generateEmailTemplate(verificationCode);
        sendEmail({email , subject : "Your Verification Code" , message});
    }
}

function generateEmailTemplate(verificationCode){
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
      <p style="font-size: 16px; color: #333;">Dear User,</p>
      <p style="font-size: 16px; color: #333;">Your verification code is:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
          ${verificationCode}
        </span>
      </div>
      <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 10 minutes.</p>
      <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
      <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
        <p>Thank you,<br>Your Company Team</p>
        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
      </footer>
    </div>
  `;
}
