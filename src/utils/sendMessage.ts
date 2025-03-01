import transport  from '../middlewares/sendMail'


const sendEmail = async (email: string, name: string, message:string) => {
    try {

        transport.verify(function (error, success) {
            if (error) {
                console.log("SMTP Connection Error:", error);
            } else {
                console.log("SMTP Connection Verified");
            }
        });

      let info = await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: email,
        subject: "Payment Confirmation",
        html: `<h1>Hello ${name}, ${message}</h1>`,
      });
      
      return info

    } catch (error) {
      console.error("Error sending email:", error);
    }
  };
  
  export default sendEmail