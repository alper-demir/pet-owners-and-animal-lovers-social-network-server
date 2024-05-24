import { Server } from "socket.io";
import Message from "./models/Messages.js";

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });

        socket.on("joinRoom", ({ roomId }) => {
            socket.join(roomId);
        });

        socket.on("message", async ({ roomId, senderId, receiverId, content }) => {
            try {
                const newMessage = new Message({
                    senderId,
                    receiverId,
                    content,
                    roomId
                });
                await newMessage.save();
                io.to(roomId).emit("message", newMessage);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });
    });
};

export default initSocket;