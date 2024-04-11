import mongoose from "mongoose";

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Database has been connected");
    }
    catch (err) {
        console.log("Database connection error!");
    }
}

export default connection;