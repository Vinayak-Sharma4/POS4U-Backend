import Customer from "../models/Customer.js";

export const createCustomer = async (req, res) => {

    try {

        const customer = await Customer.create({

            name: req.body.name,

            mobileNo: req.body.mobileNo,

            fatherName: req.body.fatherName,

            formName: req.body.formName,

            fees: req.body.fees,

            document: req.file.filename,

            createdBy: req.user?.id
        });

        res.status(201).json({

            success: true,

            message: "Customer saved successfully",

            customer
        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message
        });

    }

};