import express from 'express'
import verifyToken from "../middlewares/verifyToken.js"
import upload from '../utils/upload.js'

import { login, register, verifyTokenValid, resetPassword, changePassword, verifyEmail } from "../controllers/authController.js"
import { createPost, getOnePost, updatePost, deletePost } from "../controllers/postController.js"
import { updateProfileImage, updateProfile, getOneUser, getOneUserById, getAllPetsOfOneUser, getAllPostsOfOneUser, likePost, didUserLikeThePost, checkProfileVisibility, getAllNoticesOfOneUser, getAllAdoptionNoticesOfOneUser, search, getFollowers, getFollowings, timeline, doesUserAllowedToSeeContent, checkUsernameValid, changeUsername, changePasswordInProfile } from "../controllers/userController.js"
import { createPetProfile, getOnePet, updatePetProfile, deletePetProfile } from "../controllers/petProfileController.js"
import { createComment, deleteComment, editComment } from "../controllers/commentController.js"
import { sendFollowRequest, getPendingFollowRequestsOfOneUser, checkFollowRequest, acceptFollowRequest, rejectFollowRequest } from "../controllers/followRequestController.js"
import { createLostPetNotice, getLostPetNoticeList, getOneLostPetNotice, updateOneNotice, deleteNotice } from "../controllers/lostPetNoticeController.js"
import { createDiscussion, getDiscussionList, getOneDiscussion } from "../controllers/communityDiscussion.js"
import { createTip, deleteTip, editTip } from "../controllers/tipController.js"
import { becomeVolunteer, leaveVolunteer, getOneVolunteer, updateVolunteerCity, getVolunteersStats, getVolunteersByCity } from "../controllers/volunteerController.js"
import { createAdoptionNotice, getAdoptionNoticeList, getOneAdoptionNotice, updateOneAdoptionNotice, deleteAdoptionNotice } from "../controllers/adoptionNoticeController.js"
import { getCities } from '../controllers/indexController.js'
import { getChatHistory, verifyChatAccess, getChats } from "../controllers/chatController.js"

const router = express.Router();

// General Operations

router.get('/cities', getCities)

// Auth Operations
router.post("/register", register)

router.post("/login", login);

router.post('/verify-token', verifyTokenValid);

router.post('/reset-password', resetPassword)

router.post('/change-password', changePassword)

router.post('/verify-email/:id', verifyToken, verifyEmail)

// Post Operations
router.post("/create-post", upload.single("image"), verifyToken, createPost);

router.post('/post/:postId', verifyToken, getOnePost);

router.put('/update-post/:postId', verifyToken, updatePost)

router.delete('/delete-post/:postId', verifyToken, deletePost)

// User Operations
router.put('/update-profile-image/:userId', upload.single("image"), verifyToken, updateProfileImage);

router.put('/update-profile/:userId', verifyToken, updateProfile);

router.post("/user-data/:username", verifyToken, getOneUser);

router.get("/userbyid/:id", getOneUserById);

router.post('/pets/:username', verifyToken, getAllPetsOfOneUser);

router.post('/posts/:username', verifyToken, getAllPostsOfOneUser);

router.post('/notices/:username', verifyToken, getAllNoticesOfOneUser);

router.post('/adoption-notices/:username', verifyToken, getAllAdoptionNoticesOfOneUser);

router.post("/like-post", verifyToken, likePost);

router.post("/check-post-like-status", verifyToken, didUserLikeThePost);

router.post("/check-profile-visibility", checkProfileVisibility);

router.get("/search", search)

router.post("/followers/:id", verifyToken, getFollowers)

router.post("/followings/:id", verifyToken, getFollowings)

router.get('/timeline/:id/:type', timeline)

router.post('/check-user-allowed-to-see-content', verifyToken, doesUserAllowedToSeeContent)

router.post('/check-username', checkUsernameValid)

router.put('/change-username', changeUsername);

router.put('/change-password-in-profile', changePasswordInProfile);

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

// Community Discussions Operations

router.post("/create-discussion", verifyToken, createDiscussion)

router.get('/community-discussions', getDiscussionList)

router.get('/discussion/:id', getOneDiscussion);

// Tip Operations

router.post('/create-tip', verifyToken, createTip);

router.post('/delete-tip/:id', verifyToken, deleteTip)

router.post('/edit-tip/:id', verifyToken, editTip)

// Volunteer Operations

router.post("/volunteer", verifyToken, becomeVolunteer);

router.post("/volunteer/leave", verifyToken, leaveVolunteer);

router.get("/volunteer/:userId", getOneVolunteer);

router.put("/volunteer", updateVolunteerCity);

router.get("/volunteers/stats", getVolunteersStats);

router.get("/volunteers/:city", getVolunteersByCity);

// Adoption Notice Operations

router.post('/create-adoption-notice', upload.single('image'), verifyToken, createAdoptionNotice);

router.get('/adoption-notices', getAdoptionNoticeList);

router.get('/adoption-notice/:id', getOneAdoptionNotice);

router.put("/adoption-notice/:id", upload.single("image"), verifyToken, updateOneAdoptionNotice);

router.delete('/delete-adoption-notice/:id', verifyToken, deleteAdoptionNotice);

// Chat Operations

router.get('/chat-history/:roomId', getChatHistory);

router.get('/verify-chat-access/:roomId/:userId', verifyChatAccess);

router.get('/user-chats/:userId', getChats)
export default router;