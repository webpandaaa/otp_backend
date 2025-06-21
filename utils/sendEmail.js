import nodeMailer from "nodemailer";

export const sendEmail = async ({email , subject , messsage}) =>{
    const transporter = nodeMailer.createTransport({
        host : process.env.SMTP_HOST,
        service : process.env.SMTP_SERVICE,
        port : process.env.PORT,
        auth : {
            user : process.env.SMTP_MAIL,
            pass : process.env.SMTP_PASSWORD
        }
    });

    const options = {
        from : process.env.SMTP_MAIL,
        to : email,
        subject,
        html : messsage // we right text here if we are using normal text in message
    };

    await transporter.sendMail(options);
}