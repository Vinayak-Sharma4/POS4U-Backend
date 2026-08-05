import mongoose from "mongoose";

const connectDB = async () => {

    try {

        console.log("Connecting MongoDB...");

        const connection = await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected");

        console.log(connection.connection.host);

        console.log("Ready State :", mongoose.connection.readyState);

    } catch (error) {

        console.error("Mongo Error");

        console.error(error);

        process.exit(1);

    }

};

export default connectDB;