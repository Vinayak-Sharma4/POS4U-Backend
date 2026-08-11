import { sendContactNotifications } from "../services/contactService.js";

export const createContactMessage = async (req, res) => {
    try {
        const { name, mobile, message } = req.body;

        if (!name?.trim() || !mobile?.trim() || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name, mobile number and message are required."
            });
        }

        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10 digit mobile number."
            });
        }

        await sendContactNotifications({
            name: name.trim(),
            mobile: mobile.trim(),
            message: message.trim()
        });

        return res.status(200).json({
            success: true,
            message: "Thank you for contacting Patidar Online Services. We will shortly contact you."
        });
    } catch (error) {
        console.error("Contact notification error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to send your message right now. Please try again later."
        });
    }
};
