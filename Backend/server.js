import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import User from './models/user.js';
import SwapRequest from './models/swapRequest.js';
import Review from './models/review.js';
import AdminMessage from './models/admin.js';

const app = express();
const PORT = 3000;

// --- Helper Function ---
const wrapAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// --- Middleware ---
// IMPORTANT: Adjust the origin to match your frontend's running port if different from 5173
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json()); // For parsing application/json

// --- MongoDB Connection ---
const dbUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/skillswap';

mongoose.connect(dbUrl)
    .then(() => console.log("MongoDB connected successfully!"))
    .catch(err => console.error("MongoDB connection error:", err));


// --- API ROUTES ---

// --- 1. USER ROUTES (/api/users) ---

// GET all Users (for Admin/Search)
app.get('/api/users', wrapAsync(async (req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 });
    // Map Mongoose fields (e.g., skillOffered) to Frontend fields (e.g., skillsOffered)
    const mappedUsers = users.map(u => ({
        ...u.toObject(),
        id: u._id,
        skillsOffered: u.skillOffered,
        skillsWanted: u.skillWanted,
        isActive: u.isActive ?? true,
        rating: parseFloat(u.rating.toFixed(1))
    }));
    res.status(200).json(mappedUsers);
}));

// GET User by ID (for AuthContext)
app.get('/api/users/:id', wrapAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    
    res.status(200).json({
        ...user.toObject(),
        id: user._id,
        skillsOffered: user.skillOffered,
        skillsWanted: user.skillWanted,
        rating: parseFloat(user.rating.toFixed(1))
    });
}));

// POST new User (for Registration)
app.post('/api/users', wrapAsync(async (req, res) => {
    const userData = {
        ...req.body,
        skillOffered: req.body.skillsOffered || [],
        skillWanted: req.body.skillsWanted || [],
        role: req.body.role || 'user',
        // Mongoose automatically handles _id generation
    };
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    
    res.status(201).json({
        ...savedUser.toObject(),
        id: savedUser._id,
        skillsOffered: savedUser.skillOffered,
        skillsWanted: savedUser.skillWanted,
        rating: parseFloat(savedUser.rating.toFixed(1))
    });
}));

// PATCH/PUT User (for Profile Update/Ban User)
app.patch('/api/users/:id', wrapAsync(async (req, res) => {
    const updates = {};
    // Map frontend fields (e.g., skillsOffered) to Mongoose fields (e.g., skillOffered)
    if (req.body.skillsOffered) updates.skillOffered = req.body.skillsOffered;
    if (req.body.skillsWanted) updates.skillWanted = req.body.skillsWanted;
    if (req.body.name) updates.name = req.body.name;
    if (req.body.location) updates.location = req.body.location;
    if (req.body.availability) updates.availability = req.body.availability;
    if (req.body.isPublic !== undefined) updates.isPublic = req.body.isPublic;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    if (req.body.rating !== undefined) updates.rating = req.body.rating;
    if (req.body.totalSwaps !== undefined) updates.totalSwaps = req.body.totalSwaps;
    updates.updatedAt = Date.now(); // Manually update timestamp

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id, 
        { $set: updates }, 
        { new: true, runValidators: true }
    );
    if (!updatedUser) return res.status(404).send('User not found');
    
    res.status(200).json({
        ...updatedUser.toObject(),
        id: updatedUser._id,
        skillsOffered: updatedUser.skillOffered,
        skillsWanted: updatedUser.skillWanted,
        rating: parseFloat(updatedUser.rating.toFixed(1))
    });
}));

// --- 2. SWAP REQUEST ROUTES (/api/swaps) ---

// GET all Swap Requests (for UserDashboard and Admin)
app.get('/api/swaps', wrapAsync(async (req, res) => {
    // Populate user details, selecting only essential fields for embedding
    const requests = await SwapRequest.find({})
        .populate('fromUserId', 'id name email role isActive')
        .populate('toUserId', 'id name email role isActive')
        .sort({ createdAt: -1 });

    const feedback = await Review.find({});
    const feedbackMap = feedback.reduce((acc, curr) => {
        acc[curr.swapRequestId.toString()] = { 
            id: curr._id, 
            rating: curr.rating, 
            comment: curr.comment 
        };
        return acc;
    }, {});

    // Map Mongoose fields (camelCase) to Frontend fields (snake_case)
    const mappedRequests = requests.map(req => ({
        id: req._id,
        from_user_id: req.fromUserId._id,
        to_user_id: req.toUserId._id,
        skill_offered: req.skillOffered[0],
        skill_wanted: req.skillWanted[0],
        message: req.message,
        status: req.status,
        created_at: req.createdAt,
        updated_at: req.updatedAt,
        from_user: req.fromUserId,
        to_user: req.toUserId,
        feedback: feedbackMap[req._id.toString()]
    }));
    res.status(200).json(mappedRequests);
}));

// POST new Swap Request
app.post('/api/swaps', wrapAsync(async (req, res) => {
    // Map frontend fields (snake_case) to Mongoose fields (camelCase)
    const newRequestData = {
        fromUserId: req.body.from_user_id,
        toUserId: req.body.to_user_id,
        skillOffered: [req.body.skill_offered], // Store as array
        skillWanted: [req.body.skill_wanted], // Store as array
        message: req.body.message,
        status: req.body.status || 'pending',
    };
    const newRequest = new SwapRequest(newRequestData);
    const savedRequest = await newRequest.save();

    res.status(201).json({ 
        ...savedRequest.toObject(),
        id: savedRequest._id,
        from_user_id: savedRequest.fromUserId,
        to_user_id: savedRequest.toUserId,
        skill_offered: savedRequest.skillOffered[0],
        skill_wanted: savedRequest.skillWanted[0],
    });
}));

// PATCH Swap Request Status
app.patch('/api/swaps/:id', wrapAsync(async (req, res) => {
    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    updates.updatedAt = Date.now();

    const updatedRequest = await SwapRequest.findByIdAndUpdate(
        req.params.id, 
        { $set: updates }, 
        { new: true, runValidators: true }
    );
    if (!updatedRequest) return res.status(404).send('Swap Request not found');
    
    res.status(200).json({ 
        ...updatedRequest.toObject(),
        id: updatedRequest._id,
        from_user_id: updatedRequest.fromUserId,
        to_user_id: updatedRequest.toUserId,
        skill_offered: updatedRequest.skillOffered[0],
        skill_wanted: updatedRequest.skillWanted[0],
    });
}));


// --- 3. FEEDBACK ROUTES (/api/feedback) ---

// GET all Feedback
app.get('/api/feedback', wrapAsync(async (req, res) => {
    const feedback = await Review.find({}).sort({ createdAt: -1 });
    
    // Map Mongoose fields (camelCase) to Frontend fields (snake_case)
    const mappedFeedback = feedback.map(fb => ({
        id: fb._id,
        from_user_id: fb.fromUserId,
        to_user_id: fb.toUserId,
        swap_request_id: fb.swapRequestId,
        rating: fb.rating,
        comment: fb.comment,
        created_at: fb.createdAt
    }));
    res.status(200).json(mappedFeedback);
}));

// POST new Feedback
app.post('/api/feedback', wrapAsync(async (req, res) => {
    // Map frontend fields (snake_case) to Mongoose fields (camelCase)
    const newFeedbackData = {
        fromUserId: req.body.from_user_id,
        toUserId: req.body.to_user_id,
        swapRequestId: req.body.swap_request_id,
        rating: req.body.rating,
        comment: req.body.comment,
    };
    const newFeedback = new Review(newFeedbackData);
    const savedFeedback = await newFeedback.save();

    res.status(201).json({ 
        id: savedFeedback._id,
        from_user_id: savedFeedback.fromUserId,
        to_user_id: savedFeedback.toUserId,
        swap_request_id: savedFeedback.swapRequestId,
        rating: savedFeedback.rating,
        comment: savedFeedback.comment,
        created_at: savedFeedback.createdAt,
    });
}));


// --- 4. ADMIN MESSAGE ROUTES (/api/messages) ---

// GET all Admin Messages
app.get('/api/messages', wrapAsync(async (req, res) => {
    const messages = await AdminMessage.find({}).sort({ createdAt: -1 });
    
    // Map Mongoose fields (category, isActive) to Frontend fields (type, is_active)
    const mappedMessages = messages.map(msg => ({
        id: msg._id,
        title: msg.title,
        content: msg.content,
        type: msg.category,
        is_active: msg.isActive,
        created_at: msg.createdAt
    }));
    res.status(200).json(mappedMessages);
}));

// POST new Admin Message
app.post('/api/messages', wrapAsync(async (req, res) => {
    const newMessageData = {
        title: req.body.title,
        content: req.body.content,
        category: req.body.type,
        isActive: req.body.is_active ?? true,
    };
    const newMessage = new AdminMessage(newMessageData);
    const savedMessage = await newMessage.save();

    res.status(201).json({ 
        id: savedMessage._id,
        title: savedMessage.title,
        content: savedMessage.content,
        type: savedMessage.category,
        is_active: savedMessage.isActive,
        created_at: savedMessage.createdAt,
    });
}));

// PATCH Admin Message
app.patch('/api/messages/:id', wrapAsync(async (req, res) => {
    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.content) updates.content = req.body.content;
    if (req.body.type) updates.category = req.body.type;
    if (req.body.is_active !== undefined) updates.isActive = req.body.is_active;

    const updatedMessage = await AdminMessage.findByIdAndUpdate(
        req.params.id, 
        { $set: updates }, 
        { new: true, runValidators: true }
    );
    if (!updatedMessage) return res.status(404).send('Admin Message not found');
    
    res.status(200).json({ 
        id: updatedMessage._id,
        title: updatedMessage.title,
        content: updatedMessage.content,
        type: updatedMessage.category,
        is_active: updatedMessage.isActive,
        created_at: updatedMessage.createdAt,
    });
}));

// DELETE Admin Message
app.delete('/api/messages/:id', wrapAsync(async (req, res) => {
    const deletedMessage = await AdminMessage.findByIdAndDelete(req.params.id);
    if (!deletedMessage) return res.status(404).send('Admin Message not found');
    res.status(204).send();
}));


// --- 5. SEARCH & ANALYTICS ROUTES ---

// GET Search Users (/api/search/users?skill=...)
app.get('/api/search/users', wrapAsync(async (req, res) => {
    const { skill, location, rating, availability } = req.query;
    
    const query = {
        role: 'user', 
        isPublic: true,
        isActive: true, 
    };

    if (skill) {
        // Find users who offer the skill (case-insensitive search within the array)
        query.skillOffered = { $regex: new RegExp(skill, 'i') };
    }

    if (location) {
        query.location = location;
    }

    if (rating && rating !== 'all') {
        const minRating = parseFloat(rating);
        query.rating = { $gte: minRating };
    }

    if (availability && availability !== 'all') {
        // Find users who have the specified availability
        query.availability = availability;
    }

    const users = await User.find(query).sort({ rating: -1 });

    // Map Mongoose fields to Frontend fields
    const mappedUsers = users.map(u => ({
        ...u.toObject(),
        id: u._id,
        skillsOffered: u.skillOffered,
        skillsWanted: u.skillWanted,
        rating: parseFloat(u.rating.toFixed(1)) 
    }));
    
    res.status(200).json(mappedUsers);
}));


// GET Analytics Dashboard Data (/api/analytics/dashboard)
app.get('/api/analytics/dashboard', wrapAsync(async (req, res) => {
    const [userCounts, swapCounts, avgRatingResult] = await Promise.all([
        User.aggregate([
            { $match: { role: 'user' } },
            { $group: { _id: null, totalUsers: { $sum: 1 }, activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } } } }
        ]),
        SwapRequest.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Review.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]),
    ]);

    const swapMap = swapCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {});

    const topSkillsResult = await User.aggregate([
        { $match: { role: 'user' } },
        { $unwind: '$skillOffered' },
        { $group: { _id: '$skillOffered', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);
    
    const topSkills = topSkillsResult.map(item => ({ skill: item._id, count: item.count }));

    const analytics = {
        totalUsers: userCounts[0]?.totalUsers || 0,
        activeUsers: userCounts[0]?.activeUsers || 0,
        pendingSwaps: swapMap['pending'] || 0,
        completedSwaps: swapMap['completed'] || 0,
        averageRating: parseFloat((avgRatingResult[0]?.avgRating || 5.0).toFixed(1)),
        topSkills: topSkills,
    };

    res.status(200).json(analytics);
}));


// --- Error Handler Middleware (Centralized) ---
app.use((err, req, res, next) => {
    console.error(err);
    // Differentiate between Mongoose validation errors and others
    if (err.name === 'ValidationError') {
        return res.status(400).send({ message: "Validation failed", errors: err.errors });
    }
    res.status(500).send({ message: "An unexpected server error occurred", error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});