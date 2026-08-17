import Form from "../models/Form.js";

export const getReports = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            date = ""
        } = req.query;

        const currentPage = Math.max(Number(page), 1);
        const recordsPerPage = Math.min(Number(limit), 25);

        const query = {};

        // Date filter
        if (date) {
            const startDate = new Date(`${date}T00:00:00.000`);
            const endDate = new Date(`${date}T23:59:59.999`);

            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const totalRecords = await Form.countDocuments(query);

        const totalPages = Math.ceil(
            totalRecords / recordsPerPage
        );

        const reports = await Form.find(query)
            .select("name createdAt fees")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * recordsPerPage)
            .limit(recordsPerPage)
            .lean();

        const data = reports.map((item) => ({
            name: item.name,
            date: item.createdAt,
            amount: item.fees
        }));

        return res.status(200).json({
            success: true,
            data,
            pagination: {
                currentPage,
                recordsPerPage,
                totalRecords,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            }
        });

    } catch (error) {

        console.error("Reports Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch reports."
        });
    }
};