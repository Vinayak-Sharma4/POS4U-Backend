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