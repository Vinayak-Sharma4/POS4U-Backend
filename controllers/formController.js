import Form from "../models/Form.js";

export const createForm = async (req, res) => {
    try {

        const {
            name,
            mobile,
            fatherName,
            formName,
            fees
        } = req.body;

        if (
            !name ||
            !mobile ||
            !fatherName ||
            !formName ||
            !fees
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const form = await Form.create({

            name,

            mobile,

            fatherName,

            formName,

            fees,

            document: req.file
                ? req.file.filename
                : "",

            paymentStatus: "Pending",

            paymentId: "",

            createdBy: null
        });

        res.status(201).json({

            success: true,

            message: "Form submitted successfully.",

            data: form

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }
};