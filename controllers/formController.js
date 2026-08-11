import Form from "../models/Form.js";


// ==========================================
// CREATE FORM
// ==========================================

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

            fees: Number(fees),

            document: req.file
                ? req.file.filename
                : "",

            paymentStatus: "Pending",

            paymentId: "",

            orderId: "",

            paymentGateway: "",

            paidAt: null,

            createdBy: null

        });


        return res.status(201).json({

            success: true,

            message: "Form submitted successfully.",

            data: form

        });

    }

    catch (error) {

        console.error("Create Form Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// ==========================================
// GET ALL FORMS
// ==========================================

export const getForms = async (req, res) => {

    try {

        const forms = await Form
            .find()
            .sort({ createdAt: -1 });


        return res.status(200).json({

            success: true,

            count: forms.length,

            data: forms

        });

    }

    catch (error) {

        console.error("Get Forms Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};