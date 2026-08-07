import Form from "../models/Form.js";

export const getDashboardStats = async (req, res) => {

    try {

        const totalApplications = await Form.countDocuments();

        const pendingPayments = await Form.countDocuments({
            paymentStatus: "Pending"
        });

        const paidApplications = await Form.countDocuments({
            paymentStatus: "Paid"
        });

        const totalRevenue = await Form.aggregate([
            {
                $match: {
                    paymentStatus: "Paid"
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: "$fees"
                    }
                }
            }
        ]);

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const todaysApplications = await Form.countDocuments({
            createdAt: {
                $gte: today
            }
        });

        return res.json({

            success: true,

            data: {

                totalApplications,

                pendingPayments,

                paidApplications,

                todaysApplications,

                totalRevenue:
                    totalRevenue.length > 0
                        ? totalRevenue[0].revenue
                        : 0

            }

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};