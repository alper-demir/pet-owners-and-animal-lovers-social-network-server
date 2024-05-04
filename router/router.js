import express from 'express'
import verifyToken from "../middlewares/verifyToken.js"
import upload from '../utils/upload.js'

import { login, register, verifyTokenValid } from "../controllers/authController.js"
import { createPost, getOnePost } from "../controllers/postController.js"
import { updateProfileImage, updateProfile, getOneUser, getAllPetsOfOneUser, getAllPostsOfOneUser, likePost, didUserLikeThePost, checkProfileVisibility, getAllNoticesOfOneUser, search } from "../controllers/userController.js"
import { createPetProfile, getOnePet } from "../controllers/petProfileController.js"
import { createComment } from "../controllers/commentController.js"
import { sendFollowRequest, getPendingFollowRequestsOfOneUser, checkFollowRequest, acceptFollowRequest, rejectFollowRequest } from "../controllers/followRequestController.js"
import { createLostPetNotice, getLostPetNoticeList, getOneLostPetNotice, updateOneNotice } from "../controllers/lostPetNoticeController.js"

const router = express.Router();

// Auth Operations
router.post("/register", register)

router.post("/login", login);

router.post('/verify-token', verifyTokenValid);

// Post Operations
router.post("/create-post", upload.single("image"), verifyToken, createPost);

router.post('/post/:postId', verifyToken, getOnePost);

// User Operations
router.put('/update-profile-image/:userId', upload.single("image"), verifyToken, updateProfileImage);

router.put('/update-profile/:userId', verifyToken, updateProfile);

router.post("/user-data/:username", verifyToken, getOneUser);

router.post('/pets/:username', verifyToken, getAllPetsOfOneUser);

router.post('/posts/:username', verifyToken, getAllPostsOfOneUser);

router.post('/notices/:username', verifyToken, getAllNoticesOfOneUser);

router.post("/like-post", verifyToken, likePost);

router.post("/check-post-like-status", verifyToken, didUserLikeThePost);

router.post("/check-profile-visibility", checkProfileVisibility);

router.get("/search", search)

// Pet Profile Operations
router.post("/create-pet-profile", upload.single("image"), verifyToken, createPetProfile);

router.post('/pet/:petId', verifyToken, getOnePet);

// Comment Operations
router.post('/create-comment', verifyToken, createComment)

// Follow Request Operations
router.post("/send-follow-request", verifyToken, sendFollowRequest);

router.get('/follow-requests/:receiverId', getPendingFollowRequestsOfOneUser);

router.post("/check-follow-request", verifyToken, checkFollowRequest);

router.put("/accept-follow-request/:requestId", verifyToken, acceptFollowRequest);

router.put("/reject-follow-request/:requestId", verifyToken, rejectFollowRequest);

// Lost Pet Notice Operations
router.post('/create-lost-pet-notice', upload.single("image"), verifyToken, createLostPetNotice);

router.get('/lost-pets', getLostPetNoticeList);

router.get("/lost-pet-notice/:id", getOneLostPetNotice);

router.put("/lost-pet-notice/:id", upload.single("image"), verifyToken, updateOneNotice);

export default router;