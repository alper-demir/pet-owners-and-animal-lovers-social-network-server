import User from "../models/User.js"
import bcrypt from "bcrypt"
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    try {

        const usernameExists = await User.findOne({ username });
        const emailExists = await User.findOne({ email });

        if (usernameExists) {
            return res.json({ message: "This username is already taken by other user", status: "error" });
        }
        if (emailExists) {
            return res.json({ message: "This email is used by other user", status: "error" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ firstName, lastName, username, email, password: hashedPassword });
        if (newUser) {
            return res.json({ newUser, message: "Registration successful" }).status(201);
        }
        return res.json({ message: "User create error" }).status(404);
    }
    catch (error) {
        console.log("User create error: " + error);
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        const data = {
            userId: user?._id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            profileUrl: user?.profileUrl
        }
        if (user) {
            const compare = await bcrypt.compare(password, user.password);
            if (compare) {
                // User has been authenticated, generate and return token.
                const token = generateToken(data);

                return res.json({ message: "Successfuly logged in", login: true, token }).status(200);
            }
            return res.json({ message: "Incorret credentials", login: false }).status(401);
        }

        return res.json({ message: "Wrong email", login: false }).status(400);
    }
    catch (error) {
        console.log("Login error: " + error);
        return res.status(500).json({ message: "Server error", status: "error" });
    }
}

export const verifyTokenValid = (req, res) => {
    const token = req.headers.authorization;
    console.log("token: " + token);
    if (!token) {
        return res.json({ message: "Access denied. No valid token provided.", verify: false });
    }

    try {
        const verify = jwt.verify(token, process.env.SECRET_KEY);
        if (verify) {
            return res.json({ message: "Verified token", verify: true }).status(200);
        }

    } catch (error) {
        return res.json({ message: "Invalid or expired token.", verify: false });
    }
}