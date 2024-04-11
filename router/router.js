import express from 'express';
import User from "../models/User.js"
import Post from "../models/Post.js"
import bcrypt from "bcrypt"
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

        if (user) {
            const compare = await bcrypt.compare(password, user.password);
            if (compare) {
                return res.json({ message: "Successfully logged in", login: true }).status(200)
            }
            return res.json({ message: "Incorrect credentials", login: false }).status(204)

        }

        return res.json({ message: "Wrong email", login: false }).statusCode(400)

    }
    catch (error) {
        console.log("Login error: " + error);
    }

})

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

router.get("/:username", async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username }).populate({ path: "posts" });
        if (user) {
            return res.json({ user });
        }
        return res.json({ message: "User not found" }).status(404);
    } catch (error) {
        console.log("User find error: " + error);
        return res.json({ message: "User not found" }).status(404);
    }

})

export default router;