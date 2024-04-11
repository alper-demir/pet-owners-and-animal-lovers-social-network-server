import express from "express"
import cors from "cors"
import router from "./router/router.js";
import dotenv from "dotenv"
import connection from "./db.js"

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }))
app.use("/public", express.static("public")); // public/images
app.use(express.json());
app.use(router);
dotenv.config();

connection();

const PORT = process.env.PORT || 4540;

app.listen(PORT, () => {
    console.log(`Server runs on port: ${PORT}`);
})