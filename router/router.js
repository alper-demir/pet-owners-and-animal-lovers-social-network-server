import express from 'express'
import User from "../models/User.js"
import Post from "../models/Post.js"
import bcrypt from "bcrypt"
import verifyToken from "../middlewares/verifyToken.js"
import generateToken from "../utils/generateToken.js"
import jwt from "jsonwebtoken"

const router = express.Router();

router.post("/create-user", async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ firstName, lastName, username, email, password: hashedPassword });
        if (newUser) {
            return res.json(newUser).status(201);
        }
        return res.json({ message: "User create error" }).status(404);
    }
    catch (error) {
        console.log("User create error: " + error);
    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        const data = {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profileUrl: user.profileUrl
        }
        if (user) {
            const compare = await bcrypt.compare(password, user.password);
            if (compare) {
                // Kullanıcı başarıyla doğrulandı, tokeni oluştur ve gönder
                const token = generateToken(data);

                return res.json({ message: "Successfuly logged in", login: true, token }).status(200);
            }
            return res.json({ message: "Incorret credentials", login: false }).status(401);
        }

        return res.json({ message: "Wrong email", login: false }).status(400);
    }
    catch (error) {
        console.log("Login error: " + error);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
});

router.post("/create-post", async (req, res) => {
    const { userId, title, content, image } = req.body;
    try {
        const user = await User.findById(userId);
        if (user) {
            const newPost = await Post.create({ userId, title, content, image });
            const postId = newPost._id;
            if (newPost) {
                console.log("New post : " + newPost);
                const updatedUser = await User.findByIdAndUpdate(user, { $push: { posts: postId } }, { new: true });
                console.log({ message: `Updated user : ${updatedUser}` })
            }
        }

        return res.send("New post added")

    } catch (error) {
        console.log("Create post error: " + error);
        res.send("New post create error")
    }
})

router.get("/:username", verifyToken, async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username }).populate({ path: "posts" });
        if (user) {
            return res.json({ user });
        }
        return res.status(404).json({ message: "User not found" });
    } catch (error) {
        console.log("User find error: " + error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/verify-token', (req, res) => {
    const token = req.headers.authorization;
    console.log("token: " + token);
    if (!token) {
        return res.json({ message: "Erişim reddedildi. Geçerli bir token sağlanmadı.", verify: false });
    }

    try {
        const verify = jwt.verify(token, process.env.SECRET_KEY);
        if (verify) {
            return res.json({ message: "Verified token", verify: true }).status(200);
        }

    } catch (error) {
        return res.json({ message: "Geçersiz veya süresi dolmuş token.", verify: false });
    }
});

export default router;