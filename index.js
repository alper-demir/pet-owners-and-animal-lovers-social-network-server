import express from "express"
import cors from "cors"
import router from "./router/router.js";
import dotenv from "dotenv"
import connection from "./db.js"
import initSocket from "./socket.js"; 
import http from "http";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }))
app.use("/public", express.static("public")); // public/images
app.use(express.json());
app.use(router);
dotenv.config();

connection();
const server = http.createServer(app);

initSocket(server);

const PORT = process.env.PORT || 4540;

server.listen(PORT, () => {
    console.log(`Server runs on port: ${PORT}`);
})