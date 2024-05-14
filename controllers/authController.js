import User from "../models/User.js"
import bcrypt from "bcrypt"
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken"
import sendEmail from "../utils/sendEmail.js";

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
            const token = jwt.sign({ id: newUser._id, email: email }, process.env.SECRET_KEY, { expiresIn: "1d" });
            sendEmail(email, "Confirm your POALSNet Registration", `Thank you for registering on the POALSNet platform. Please use this link to confirm your POALSNet account. The link is valid for 24 hours: ${process.env.CLIENT_URL}/confirm-account/${token}/${newUser._id} If you have not done this, please do not take any action. Regards.`);
            return res.json({ newUser, message: "We have sent you the account confirm link. Please check your email box." }).status(201);
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
                if (!user.isVerified) {
                    const token = jwt.sign({ id: user._id, email: email }, process.env.SECRET_KEY, { expiresIn: "1d" });
                    sendEmail(email, "Confirm your POALSNet Registration", `Please use this link to confirm your POALSNet account. The link is valid for 24 hours: ${process.env.CLIENT_URL}/confirm-account/${token}/${user._id} If you have not done this, please do not take any action. Regards.`);
                    return res.json({ message: "Your account is not validated please check your email box to confirm your account.", login: false }).status(200);
                } else {
                    // User has been authenticated, generate and return token.
                    const token = generateToken(data);
                    return res.json({ message: "Successfuly logged in", login: true, token }).status(200);
                }
            }
            return res.json({ message: "Incorret credentials please check your password.", login: false }).status(401);
        }

        return res.json({ message: "Your email is wrong.", login: false }).status(400);
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

export const resetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: "Incorrect mail!", status: "error" }).status(400)
        }
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "5m" });
        sendEmail(email, "Reset Your POALSNet Password", `Please use this link to reset your password. The link is valid for 5 minutes: ${process.env.CLIENT_URL}/reset-password/${token}/${user._id}`);
        return res.json({ message: "We have sent you the password reset link. Please check your email box.", status: "success" });
    } catch (error) {
        console.log(error);
        return res.json({ message: "An error occured during email send.", status: "error" });
    }
}

export const changePassword = async (req, res) => {
    const { id, password } = req.body;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.json({ message: "User error! Try later.", status: "error" }).status(400)
        }

        const hashedNewPassword = await bcrypt.hash(password, 10);

        const updatedPassword = await user.updateOne({ password: hashedNewPassword }, { new: true });
        if (updatedPassword) {
            return res.json({ message: "Password changed successfully.", status: "success" });
        }

        return res.json({ message: "Password change error.", status: "error" });
    } catch (error) {
        console.log(error);
        return res.json({ message: "An error occured during change password.", status: "error" });
    }
}

export const verifyEmail = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (user.isVerified) {
            return res.json({ message: `${user.email} is already verified!`, status: "warning" });
        } else {
            const user = await User.findByIdAndUpdate(id, { isVerified: true });
            if (!user) {
                return res.json({ message: "Email verify error! Try later.", status: "error" }).status(400)
            }
        }
        return res.json({ message: "Email verified successfully.", status: "success" });
    } catch (error) {
        return res.json({ message: "An error occured during email verification.", status: "error" });
    }
}