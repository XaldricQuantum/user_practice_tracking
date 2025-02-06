import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import User from './models/User.js';
import Exercise from './models/Exercise.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('connected', () => console.log('✅ Mongoose connected to DB'));

// Log all incoming request URLs
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    next();
});

// Serve frontend
app.get('/', (req, res) => res.sendFile(`${process.cwd()}/views/index.html`));

// 🚀 Create a new user
app.post('/api/users', async (req, res) => {
    try {
        const { username } = req.body;
        let user = await User.findOne({ username });

        if (!user) {
            user = new User({ username });
            await user.save();
            console.log(`✅ User created: ${user.username}`);
        }

        res.json({ _id: user._id, username: user.username });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({ error: 'Could not create user' });
    }
});

// 📌 Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('_id username');
        res.json(users);
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({ error: 'Could not fetch users' });
    }
});

// 🏋️ Add an exercise for a user
app.post('/api/users/:_id/exercises', async (req, res) => {
    try {
        const { _id } = req.params;
        const { description, duration, date } = req.body;

        const user = await User.findById(_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const exercise = new Exercise({
            userId: _id,
            username: user.username,
            description,
            duration: Number(duration),
            date: date ? new Date(date) : new Date(),
        });

        await exercise.save();

        res.json({
            _id: user._id,
            username: user.username,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString(),
        });
    } catch (error) {
        console.error('❌ Error saving exercise:', error);
        res.status(500).json({ error: 'Exercise not saved' });
    }
});

// 📜 Get exercise logs with optional filters
app.get('/api/users/:_id/logs', async (req, res) => {
    try {
        const { _id } = req.params;
        const { from, to, limit } = req.query;

        const user = await User.findById(_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let filter = { userId: _id };

        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }

        const exercises = await Exercise.find(filter)
            .limit(Number(limit) || 0)
            .select('description duration date');

        res.json({
            _id: user._id,
            username: user.username,
            count: exercises.length,
            log: exercises.map((ex) => ({
                description: ex.description,
                duration: ex.duration,
                date: ex.date.toDateString(),
            })),
        });
    } catch (error) {
        console.error('❌ Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});

// 🚀 Start server
app.listen(PORT, () => console.log(`✅ Server running on: http://localhost:${PORT}`));
