import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export const sendSignupRequestEmail = async (request, token) => {

    const baseUrl =
        process.env.BACKEND_PUBLIC_URL ||
        "https://pos4u-backend.onrender.com";

    const approveUrl =
        `${baseUrl}/api/auth/signup/approve/${token}`;

    const rejectUrl =
        `${baseUrl}/api/auth/signup/reject/${token}`;

    await transporter.sendMail({

        from: `POS4U Website <${process.env.GMAIL_USER}>`,

        to:
            process.env.CONTACT_EMAIL ||
            "vermaavesh54@gmail.com",

        subject: "New POS4U User Signup Request",

        html: `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">

                <h2 style="color:#800020;">
                    New POS4U Signup Request
                </h2>

                <p>
                    A new user has submitted a request for access to the POS4U Admin system.
                </p>

                <hr>

                <h3>Applicant Details</h3>

                <p><strong>Name:</strong> ${request.name}</p>

                <p><strong>Mobile:</strong> ${request.mobile}</p>

                <p><strong>Email:</strong> ${request.email}</p>

                <p><strong>Address:</strong> ${request.address}</p>

                <p><strong>Date Of Birth:</strong>
                    ${new Date(request.dateOfBirth).toLocaleDateString()}
                </p>

                <p><strong>Profession:</strong> ${request.profession}</p>

                <p><strong>City:</strong> ${request.city}</p>

                <hr>

                <p>
                    Please choose whether you want to provide access to this user.
                </p>

                <div style="margin-top:25px;">

                    <a
                        href="${approveUrl}"
                        style="
                            display:inline-block;
                            padding:12px 22px;
                            background:#198754;
                            color:white;
                            text-decoration:none;
                            border-radius:6px;
                            margin-right:10px;
                        "
                    >
                        Approve Access
                    </a>

                    <a
                        href="${rejectUrl}"
                        style="
                            display:inline-block;
                            padding:12px 22px;
                            background:#dc3545;
                            color:white;
                            text-decoration:none;
                            border-radius:6px;
                        "
                    >
                        Reject Request
                    </a>

                </div>

            </div>
        `
    });
};


export const sendAccountCreatedEmail = async ({
    email,
    name,
    username,
    password
}) => {

    await transporter.sendMail({

        from: `Patidar Online Services <${process.env.GMAIL_USER}>`,

        to: email,

        subject: "POS4U Account Approved - Login Details",

        html: `
            <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">

                <h2 style="color:#800020;">
                    Patidar Online Services
                </h2>

                <p>
                    Hello <strong>${name}</strong>,
                </p>

                <p>
                    Your POS4U account has been approved by the administrator.
                </p>

                <h3>Your Login Details</h3>

                <div
                    style="
                        background:#f5f5f5;
                        padding:20px;
                        border-radius:8px;
                    "
                >

                    <p>
                        <strong>User ID:</strong> ${username}
                    </p>

                    <p>
                        <strong>Password:</strong> ${password}
                    </p>

                </div>

                <p>
                    You can now use the Admin Login section of the POS4U website.And please change your password after logging in for the first time.
                </p>

                <p>
                    Please keep your login credentials secure.
                </p>

                <p>
                    Thanks,<br>
                    <strong>Patidar Online Services</strong>
                </p>

            </div>
        `
    });
};
export const sendPasswordResetEmail = async ({
    email,
    name,
    resetUrl
}) => {

    await transporter.sendMail({

        from: `"Patidar Online Services" <${process.env.GMAIL_USER}>`,

        to: email,

        subject: "POS4U - Reset Your Password",

        html: `
            <!DOCTYPE html>

            <html>

            <head>
                <meta charset="UTF-8">
                <title>Password Reset</title>
            </head>

            <body
                style="
                    margin:0;
                    padding:0;
                    background:#f5f5f5;
                    font-family:Arial, sans-serif;
                "
            >

                <div
                    style="
                        max-width:600px;
                        margin:40px auto;
                        background:#ffffff;
                        padding:40px;
                        border-radius:15px;
                        box-shadow:0 5px 25px rgba(0,0,0,0.12);
                    "
                >

                    <h2
                        style="
                            color:rgb(128,0,32);
                            text-align:center;
                        "
                    >
                        Patidar Online Services
                    </h2>

                    <h3>
                        Hello ${name || "User"},
                    </h3>

                    <p>
                        We received a request to reset your POS4U account password.
                    </p>

                    <p>
                        Click the button below to create a new password.
                    </p>

                    <div style="text-align:center; margin:30px 0;">

                        <a
                            href="${resetUrl}"
                            style="
                                display:inline-block;
                                padding:14px 28px;
                                color:#ffffff;
                                text-decoration:none;
                                border-radius:8px;
                                font-weight:bold;
                                background:linear-gradient(
                                    90deg,
                                    rgb(128,0,32),
                                    rgb(231,84,128)
                                );
                            "
                        >
                            Reset Password
                        </a>

                    </div>

                    <p>
                        This password reset link will expire in
                        <strong>15 minutes</strong>.
                    </p>

                    <p>
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                    <hr>

                    <p
                        style="
                            color:#777;
                            font-size:13px;
                            text-align:center;
                        "
                    >
                        Patidar Online Services • One Stop Digital Service Center
                    </p>

                </div>

            </body>

            </html>
        `
    });
};