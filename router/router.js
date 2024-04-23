import express from 'express'
import User from "../models/User.js"
import Post from "../models/Post.js"
import Pet from "../models/PetProfile.js"
import Comment from "../models/Comments.js"
import Like from "../models/Likes.js"
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

router.post("/user-data/:username", verifyToken, async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username }, { about: 1, firstName: 1, lastName: 1, posts: 1, pets: 1, username: 1 });
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

router.post('/posts/:username', verifyToken, async (req, res) => {
    const username = req.params.username;

    try {
        const posts = await User.findOne({ username }).populate("posts").select("posts");
        res.json(posts); // Postları JSON olarak yanıtla
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası' }); // Sunucu hatası durumunda hata mesajı ile yanıtla
    }
});

router.post("/create-pet-profile", async (req, res) => {
    const { userId, name, species, breed, birthDate, profileUrl, weight, color } = req.body;
    try {
        const user = await User.findById(userId);
        if (user) {
            const newPetProfile = await Pet.create({ userId, name, species, breed, birthDate, profileUrl, weight, color });
            const petProfileId = newPetProfile._id;
            if (newPetProfile) {
                console.log("New pet profile: " + newPetProfile);
                const updatedUser = await User.findByIdAndUpdate(user, { $push: { pets: petProfileId } }, { new: true });
                console.log({ message: `Updated user: ${updatedUser}` });
            }
        }

        return res.send("New pet profile added");

    } catch (error) {
        console.log("Create pet profile error: " + error);
        res.send("New pet profile create error");
    }
});

router.post('/pets/:username', verifyToken, async (req, res) => {
    const username = req.params.username;

    try {
        const pets = await User.findOne({ username }).populate("pets").select("pets");
        res.json(pets); // Postları JSON olarak yanıtla
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası' }); // Sunucu hatası durumunda hata mesajı ile yanıtla
    }
});

router.post('/pet/:petId', verifyToken, async (req, res) => {
    const petId = req.params.petId;
    try {
        const pet = await Pet.findById(petId).populate("userId", { username: 1 }).select();
        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası' }); // Sunucu hatası durumunda hata mesajı ile yanıtla
    }
});

router.post('/post/:postId', verifyToken, async (req, res) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId).populate("userId", { username: 1, profileUrl: 1, firstName: 1, lastName: 1 }) // owner of post
            .populate({
                path: "comments",
                populate: {
                    path: "userId",
                    select: { username: 1, profileUrl: 1, firstName: 1, lastName: 1 } // selection of needed fields
                }
            })
            .populate("likes", { username: 1, profileUrl: 1, firstName: 1, lastName: 1 })
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

router.post('/create-comment', verifyToken, async (req, res) => {
    const { userId, postId, content } = req.body;
    try {
        const user = await User.findById(userId);
        if (user) {
            const newComment = await Comment.create({ userId, postId, content });
            const commentId = newComment._id;
            if (newComment) {
                console.log("New post : " + newComment);
                await User.findByIdAndUpdate(user, { $push: { comments: commentId } }, { new: true });
                await Post.findByIdAndUpdate(postId, { $push: { comments: commentId } }, { new: true });
            }
            return res.json({ newComment, message: "New comment added" })
        }


    } catch (error) {
        console.log("Create comment error: " + error);
        res.send("New comment create error")
    }
})

router.post("/like-post", verifyToken, async (req, res) => {
    const { userId, postId } = req.body;
    try {
        const user = await User.findById(userId);
        const post = await Post.findById(postId);

        if (!user.likes.includes(postId)) {
            await post.updateOne({ $push: { likes: userId } });
            await user.updateOne({ $push: { likes: postId } });
            return res.json({ message: "New like pushed!", liked: true });

        } else {
            await post.updateOne({ $pull: { likes: userId } });
            await user.updateOne({ $pull: { likes: postId } });
            return res.json({ message: "Like pulled!", liked: false });
        }


    } catch (error) {
        console.log("Create like error: " + error);
        res.status(500).json({ message: "New like create error" });
    }
});

router.post("/check-post-like-status", verifyToken, async (req, res) => {
    const { userId, postId } = req.body;
    try {
        // Kullanıcının likes alanında postId'yi içeren bir girişi var mı kontrol et
        const user = await User.findById(userId);
        const liked = user.likes.includes(postId);
        
        res.json({ liked });
    } catch (error) {
        console.error("Check post like status error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//timeline alanı için kullanılabilir yapı
// router.post("/check-post-like-status", verifyToken, async (req, res) => {
//     const { userId } = req.body;
//     try {
//         // Kullanıcının beğendiği tüm postları al
//         const user = await User.findById(userId);
//         const likedPosts = user.likes;

//         // Tüm postları al
//         const allPosts = await Post.find();

//         // Her bir post için kontrol et ve beğenildiyse liked: true, değilse liked: false
//         const updatedPosts = allPosts.map(post => ({
//             ...post.toObject(),
//             liked: likedPosts.includes(post._id)
//         }));

//         res.json(updatedPosts);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Sunucu hatası' });
//     }
// });




export default router;