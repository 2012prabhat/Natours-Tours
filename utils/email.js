// Import Nodemailer
const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport

const sendEmail = async options=>{

    
    var transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "79f17a562b9677",
          pass: "21da9accbbd413"
        }
      });

// Set up email data
let mailOptions = {
    from: "Prabhat Kumar from Natours", // Sender address
    to: options.email, // List of receivers
    subject: options.subject, // Subject line
    text: options.text, // Plain text body
    html: options.message // HTML body (optional)
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Error occurred:', error);
    }
    console.log('Message sent: %s', info.messageId);
});

}

module.exports = sendEmail