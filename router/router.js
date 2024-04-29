import express from 'express'
import User from "../models/User.js"
import Post from "../models/Post.js"
import Pet from "../models/PetProfile.js"
import Comment from "../models/Comments.js"
import FollowRequest from "../models/FollowRequest.js"
import LostPet from "../models/LostPet.js"
import bcrypt from "bcrypt"
import verifyToken from "../middlewares/verifyToken.js"
import generateToken from "../utils/generateToken.js"
import jwt from "jsonwebtoken"
import upload from '../utils/upload.js'
import fs from "fs"
import path from "path"
const router = express.Router();

router.post("/register", async (req, res) => {
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

router.post("/create-post", upload.single("image"), verifyToken, async (req, res) => {
    const { userId, content } = req.body; // userId ve content gibi diğer verileri al
    const title = "Your Title"; // Gerekirse başlık da alınabilir veya sabit bir değer atanabilir

    if (!req.file) { // Dosya yüklenmediyse hata gönder
        return res.status(400).json({ message: "Please select a file", status: "error" });
    }

    try {
        const newPost = await Post.create({ userId, title, content, image: req.file.filename });
        const postId = newPost._id;
        const updatedUser = await User.findByIdAndUpdate(userId, { $push: { posts: postId } }, { new: true });

        console.log("New post:", newPost);
        console.log("Updated user:", updatedUser);

        return res.status(201).json({ message: "New post added", status: "success" });
    } catch (error) {
        console.error("Create post error:", error);
        return res.status(500).json({ message: "An error occurred while creating post", status: "error" });
    }
});

router.put('/update-profile-image/:userId', upload.single("image"), verifyToken, async (req, res) => {
    console.log(req.file.filename);
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { profileUrl: req.file.filename });
        if (updatedUser && user.profileUrl) {
            // Delete old profile pic
            fs.unlink(path.join(process.cwd(), 'public', 'images', user.profileUrl), (err) => { console.log(err) });
            return res.json({ message: "Profile picture updated.", status: "success" }).status(200);
        } else {
            return res.json({ message: "Profile picture update failed." }).status(400);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.put('/update-profile/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    const updateFields = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (updatedUser) {
            return res.json({ message: "Profile updated successfully.", status: "success" });
        } else {
            return res.status(404).json({ message: "User not found.", status: "error" });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: "An error occurred while updating profile.", status: "error" });
    }
});

router.post("/user-data/:username", verifyToken, async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username }, { about: 1, firstName: 1, lastName: 1, posts: 1, pets: 1, username: 1, profileUrl: 1, privacy: 1, gender: 1 });
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

router.post("/create-pet-profile", upload.single("image"), verifyToken, async (req, res) => {
    const { userId, name, species, breed, birthDate, weight, color, gender } = req.body;
    const image = req.file.filename;
    try {
        const user = await User.findById(userId);
        if (user && image) {
            const newPetProfile = await Pet.create({ userId, name, species, breed, birthDate, profileUrl: image, weight, color, gender });
            const petProfileId = newPetProfile._id;
            if (newPetProfile) {
                console.log("New pet profile: " + newPetProfile);
                const updatedUser = await User.findByIdAndUpdate(user, { $push: { pets: petProfileId } }, { new: true });
                console.log({ message: `Updated user: ${updatedUser}` });
                return res.json({ message: "New pet profile added", status: "success" });
            }
        }
        return res.json({ message: "New pet profile create error", status: "error" });

    } catch (error) {
        console.log("Create pet profile error: " + error);
        return res.json({ message: "New pet profile create error", status: "error" });
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

router.post("/send-friend-request", verifyToken, async (req, res) => {
    const { senderId, receiverId } = req.body;
    console.log(senderId, receiverId);
    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (senderId == receiverId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }
        // If the sender is already following the receiver, unfollow
        if (sender.followings.includes(receiverId)) {
            sender.followings.pull(receiverId);
            receiver.followers.pull(senderId)
            await sender.save();
            await receiver.save();
            await FollowRequest.findOneAndDelete({ senderId, receiverId })
            return res.status(200).json({ message: "Unfollowed successfully" });
        }
        // If the receiver user's account is not private, add them directly as a follower
        if (receiver.privacy !== "private") {
            sender.followings.push(receiverId);
            receiver.followers.push(senderId);
            await sender.save();
            await receiver.save();
            await FollowRequest.create({ senderId, receiverId, status: "accepted" });
            return res.status(200).json({ message: "Followed successfully" });
        } else {
            const existingRequest = await FollowRequest.findOne({ senderId, receiverId });

            if (existingRequest) {
                // If a request with the same sender and receiver is found, remove it
                await FollowRequest.findByIdAndDelete(existingRequest._id);
                return res.status(200).json({ message: "A previous request has been withdrawn." });
            } else {
                await FollowRequest.create({ senderId, receiverId, status: "pending" });
                return res.status(200).json({ message: "Friend request sent successfully" });
            }
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.get('/follow-requests/:receiverId', async (req, res) => {
    const receiverId = req.params.receiverId;

    try {
        // Find requests with receiverId and status "pending"
        const followRequests = await FollowRequest.find({ receiverId: receiverId, status: "pending" }).populate({ path: "senderId", select: { username: 1, profileUrl: 1 } });

        if (followRequests) {
            res.json(followRequests);
        } else {
            res.status(404).json({ message: 'Bekleyen takip isteği bulunamadı.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// checks status of request for single user
router.post("/check-friend-request", verifyToken, async (req, res) => {

    const { senderId, receiverUsername } = req.body;
    try {
        const receiver = await User.findOne({ username: receiverUsername }, { _id: 1 })
        const request = await FollowRequest.findOne({ senderId, receiverId: receiver._id });

        if (request) {
            return res.status(200).json({ status: request.status });
        } else {
            return res.status(200).json({ status: "not_requested" });
        }
    } catch (error) {
        console.error("Error checking friend request:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// checks profile visibility for private accounts
router.post("/check-profile-visibility", async (req, res) => {
    const { currentUserId, username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user._id.toString() === currentUserId) {
            // If the user is on their own profile, don't do any checks
            return res.status(200).json({ message: "Own profile" });
        }

        const isFollowing = user.followers.includes(currentUserId);
        const isPrivate = user.privacy === "private";
        let visibility = false;
        if (!isPrivate || isFollowing) {
            visibility = true
        }

        return res.status(200).json({ isFollowing, isPrivate, visibility });
    } catch (error) {
        console.error("Error checking profile visibility:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.put("/accept-follow-request/:requestId", verifyToken, async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await FollowRequest.findByIdAndUpdate(requestId, { status: "accepted" }, { new: true });
        if (!request) {
            return res.status(404).json({ message: "Follow request not found" });
        }
        const receiver = await User.findById(request.receiverId);
        const sender = await User.findById(request.senderId);
        receiver.followers.push(sender._id);
        sender.followings.push(receiver._id);
        await receiver.save();
        await sender.save();
        return res.status(200).json({ message: "Follow request accepted successfully" });
    } catch (error) {
        console.error("Error accepting follow request:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.put("/reject-follow-request/:requestId", verifyToken, async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await FollowRequest.findOneAndDelete(requestId)
        if (!request) {
            return res.status(404).json({ message: "Follow request not found" });
        }
        return res.status(200).json({ message: "Follow request rejected successfully" });
    } catch (error) {
        console.error("Error rejecting follow request:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post('/create-lost-pet-notice', upload.single("image"), verifyToken, async (req, res) => {
    try {
        const {
            name,
            species,
            age,
            gender,
            color,
            breed,
            city,
            lastSeenLocation,
            lastSeenDate,
            lostStatus,
            contactPhoneNumber,
            contactEmail,
            description,
            userId
        } = req.body;

        const image = req.file.filename

        const newLostPet = {
            name,
            species,
            age,
            gender,
            image,
            color,
            breed,
            city,
            lastSeenLocation,
            lastSeenDate,
            lostStatus,
            contactPhoneNumber,
            contactEmail,
            description,
            userId
        };

        try {
            const user = await User.findById(userId);
            if (user && image) {
                const newLostNotice = await LostPet.create(newLostPet);
                const lostNoticeId = newLostNotice._id;
                if (newLostNotice) {
                    console.log("New lost notice: " + newLostNotice);
                    const updatedUser = await User.findByIdAndUpdate(userId, { $push: { notices: lostNoticeId } }, { new: true });
                    console.log({ message: `Updated user: ${updatedUser}` });
                    return res.json({ message: "New lost notice created", status: "success" }).status(201);
                }
            }

        } catch (error) {
            console.log("Create lost notice  error: " + error);
            return res.json({ message: "New lost notice create error", status: "error" });
        }


    } catch (error) {
        console.error('Error creating lost pet notice:', error);
        return res.status(500).json({ message: 'Server error' });
    }

});

router.get('/lost-pets', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        // Veritabanından kayıp hayvan ilanlarını sayfalama ile al
        const lostPets = await LostPet.find().populate("createdBy", { username: 1, firstName: 1, lastName: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        // Toplam ilan sayısını al
        const totalCount = await LostPet.countDocuments();

        // Toplam sayfa sayısını hesapla
        const totalPages = Math.ceil(totalCount / limit);
        // Mevcut sayfa, toplam sayfa ve ilan listesini yanıt olarak gönder
        return res.status(200).json({
            lostPets,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Error listing lost pet listings:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get("/lost-pet-notice/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const lostPet = await LostPet.findById(id).populate("userId", { firstName: 1, lastName: 1, username: 1 });
        if (!lostPet) {
            return res.status(404).json({ message: "Lost pet not found" });
        }
        res.status(200).json(lostPet);
    } catch (error) {
        console.error("Error fetching lost pet details:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/lost-pet-notice/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // Giriş yapan kullanıcının ID'si
    const {
        name,
        species,
        age,
        gender,
        image,
        color,
        breed,
        city,
        lastSeenLocation,
        lastSeenDate,
        lostStatus,
        contactPhoneNumber,
        contactEmail,
        description,
    } = req.body;

    const updatedLostPet = {};
    updatedLostPet.name = name?.trim();
    updatedLostPet.species = species?.trim();
    updatedLostPet.age = age;
    updatedLostPet.gender = gender?.trim();
    updatedLostPet.image = image?.trim();
    updatedLostPet.color = color?.trim();
    updatedLostPet.breed = breed?.trim();
    updatedLostPet.city = city?.trim();
    updatedLostPet.lastSeenLocation = lastSeenLocation?.trim();
    updatedLostPet.lastSeenDate = lastSeenDate;
    updatedLostPet.lostStatus = lostStatus?.trim();
    updatedLostPet.contactPhoneNumber = contactPhoneNumber?.trim();
    updatedLostPet.contactEmail = contactEmail?.trim();
    updatedLostPet.description = description?.trim();
    try {
        // İlanı bul ve kullanıcı ID'siyle eşleşip eşleşmediğini kontrol et
        const lostPet = await LostPet.findByIdAndUpdate(id, updatedLostPet, { new: true });
        if (!lostPet) {
            return res.status(404).json({ message: "Lost pet not found" });
        }
        if (lostPet.createdBy._id.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this lost pet notice" });
        }

        if (lostPet) {
            return res.status(200).json({ message: "Lost pet notice updated successfully", lostPet });
        }

    } catch (error) {
        console.error("Error updating lost pet notice:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post('/notices/:username', verifyToken, async (req, res) => {
    const username = req.params.username;

    try {
        const notices = await User.findOne({ username }).populate("notices").select("notices");
        res.json(notices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;