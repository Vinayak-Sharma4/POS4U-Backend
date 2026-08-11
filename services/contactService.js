// import nodemailer from "nodemailer";

// const sendEmail = async ({ name, mobile, message }) => {
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.GMAIL_USER,
//             pass: process.env.GMAIL_APP_PASSWORD
//         }
//     });

//     await transporter.sendMail({
//         from: `POS4U Website <${process.env.GMAIL_USER}>`,
//         to: process.env.CONTACT_EMAIL || "vermaavesh54@gmail.com",
//         replyTo: process.env.GMAIL_USER,
//         subject: `New Website Enquiry - ${name}`,
//         text: [
//             "New enquiry received from POS4U website",
//             "",
//             `Name: ${name}`,
//             `Mobile: ${mobile}`,
//             `Message: ${message}`
//         ].join("\n")
//     });
// };

// // const sendSms = async ({ mobile }) => {
// //     const params = new URLSearchParams({
// //         To: `+91${mobile}`,
// //         From: process.env.TWILIO_PHONE_NUMBER,
// //         Body: "Thank You for the Patidar online Services we will shortly contact with you"
// //     });

// //     const credentials = Buffer.from(
// //         `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
// //     ).toString("base64");

// //     const response = await fetch(
// //         `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
// //         {
// //             method: "POST",
// //             headers: {
// //                 Authorization: `Basic ${credentials}`,
// //                 "Content-Type": "application/x-www-form-urlencoded"
// //             },
// //             body: params
// //         }
// //     );

// //     if (!response.ok) {
// //         const error = await response.text();
// //         throw new Error(`SMS service failed: ${error}`);
// //     }
// // };

// const sendSms = async ({ mobile }) => {
//     const params = new URLSearchParams({
//         To: `+91${mobile}`,
//         From: process.env.TWILIO_PHONE_NUMBER,
//         Body: "Reminder: Appt Tue Oct 29, 3:00 PM. Reply C to confirm or R to reschedule. Test message from Twilio."
//     });

//     const credentials = Buffer.from(
//         `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
//     ).toString("base64");

//     const response = await fetch(
//         `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
//         {
//             method: "POST",
//             headers: {
//                 Authorization: `Basic ${credentials}`,
//                 "Content-Type": "application/x-www-form-urlencoded"
//             },
//             body: params
//         }
//     );

//     if (!response.ok) {
//         const error = await response.text();
//         throw new Error(`SMS service failed: ${error}`);
//     }

//     const result = await response.json();

//     console.log("Twilio SMS sent successfully:", result.sid);

//     return result;
// };
// export const sendContactNotifications = async (data) => {

//     let emailSent = false;
//     let smsSent = false;

//     try {
//         await sendEmail(data);
//         emailSent = true;
//     } catch (error) {
//         console.error("Email notification error:", error);
//     }

//     try {
//         await sendSms(data);
//         smsSent = true;
//     } catch (error) {
//         console.error("SMS notification error:", error);
//     }

//     return {
//         emailSent,
//         smsSent
//     };
// };

import nodemailer from "nodemailer";

const sendEmail = async ({ name, mobile, message }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `POS4U Website <${process.env.GMAIL_USER}>`,
        to: process.env.CONTACT_EMAIL || "vermaavesh54@gmail.com",
        replyTo: process.env.GMAIL_USER,

        subject: `New Website Enquiry - ${name}`,

        text: [
            "New enquiry received from POS4U website",
            "",
            `Name: ${name}`,
            `Mobile: ${mobile}`,
            `Message: ${message}`
        ].join("\n")
    });
};

export const sendContactNotifications = async (data) => {
    // Email only for now
    await sendEmail(data);
};