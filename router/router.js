import express from 'express'
import verifyToken from "../middlewares/verifyToken.js"
import upload from '../utils/upload.js'

import { login, register, verifyTokenValid, resetPassword, changePassword } from "../controllers/authController.js"
import { createPost, getOnePost, updatePost, deletePost } from "../controllers/postController.js"
import { updateProfileImage, updateProfile, getOneUser, getAllPetsOfOneUser, getAllPostsOfOneUser, likePost, didUserLikeThePost, checkProfileVisibility, getAllNoticesOfOneUser, search, getFollowers, getFollowings, timeline } from "../controllers/userController.js"
import { createPetProfile, getOnePet, updatePetProfile, deletePetProfile } from "../controllers/petProfileController.js"
import { createComment, deleteComment, editComment } from "../controllers/commentController.js"
import { sendFollowRequest, getPendingFollowRequestsOfOneUser, checkFollowRequest, acceptFollowRequest, rejectFollowRequest } from "../controllers/followRequestController.js"
import { createLostPetNotice, getLostPetNoticeList, getOneLostPetNotice, updateOneNotice, deleteNotice } from "../controllers/lostPetNoticeController.js"

const router = express.Router();

// Auth Operations
router.post("/register", register)

router.post("/login", login);

router.post('/verify-token', verifyTokenValid);

router.post('/reset-password', resetPassword)

router.post('/change-password', changePassword)

// Post Operations
router.post("/create-post", upload.single("image"), verifyToken, createPost);

router.post('/post/:postId', verifyToken, getOnePost);

router.put('/update-post/:postId', verifyToken, updatePost)

router.delete('/delete-post/:postId', verifyToken, deletePost)

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

router.post("/followers/:id", verifyToken, getFollowers)

router.post("/followings/:id", verifyToken, getFollowings)

router.get('/timeline/:id/:type', timeline)

// Pet Profile Operations
router.post("/create-pet-profile", upload.single("image"), verifyToken, createPetProfile);

router.post('/pet/:id', verifyToken, getOnePet);

router.put("/pet-profile/:id", upload.single("image"), verifyToken, updatePetProfile);

router.delete('/delete-pet-profile/:id', verifyToken, deletePetProfile)

// Comment Operations
router.post('/create-comment', verifyToken, createComment)

router.post('/delete-comment/:id', verifyToken, deleteComment)

router.post('/edit-comment/:id', verifyToken, editComment)

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

router.delete('/delete-notice/:id', verifyToken, deleteNotice);

export default router;