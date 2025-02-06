import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import User from './models/User.js';
import Exercise from './models/Exercise.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('connected', () => console.log('✅ Mongoose connected to DB'));


// Log passed in Urls 
app.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
})

app.get('/', (req, res) => {
    res.sendFile(`${process.cwd()}/views/index.html`)
});

app.post('/api/users', async (req, res) => {
    const userName = req.body.username;
    const newUser = new User({username: req.body.username});
    let savedUser;
    savedUser = await User.findOne({username: userName});
    if (!savedUser) {
        try {
            savedUser = await newUser.save()
            console.log(`User ${savedUser} saved.`);
            
        } catch (err) {
            console.log(err);
            
            return res.json({error: "could not create user"})
        }
    }

    return res.json({username: savedUser.username, _id: savedUser._id})
})

app.get('/api/users', async (req, res) => {
    const allUsers = await User.find();
    console.log(allUsers);
    return res.json(allUsers)
    
})

app.post('/api/users/:_id/exercises', async (req, res) => {
    
    try {
        const userId = req.params._id, description = req.body.description,
         duration = req.body.duration, date = req.body.date;
        const user = await User.findById(userId)
        console.log("user ",userId, user.username );
        const newExercise = new Exercise({userId: userId, username: user.username,
            description: description, duration: duration, date: date || Date.now()
        })
        const exercise = await newExercise.save();
        // const newExercise = new Exercise({userId: , });

        // console.log(allExercises);
        return res.json({_id: userId, username: exercise.username, 
            date: exercise.date.toDateString(), duration: exercise.duration, description: exercise.description })
    } catch (err) {
        console.log("somethig bad happend");
        console.log(err);
        return res.json({error: "not saved!"})
        
    }
    
});

app.get('/api/users/:_id/logs', async (req, res) => {
    const userId = req.params._id;
    let filter = {userId};
    let allExercises;
    let user;
    try {
        const from = req.query['from'];
        const to = req.query['to'];
        const limit = req.query.limit;
        console.log("from, to , limit :", from, to, limit);
        
        if (from || to) {
            filter.date = {}
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }
        let query = Exercise.find(filter);
        if (limit) query = query.limit(Number(limit));
        allExercises = await Exercise.find(query);
        user = await User.findById(userId);
        // console.log(userId);
        console.log("user: ", user);
        console.log(allExercises);
    } catch (err) {
        console.log("query failed 107");
        console.log(err);
        return null;
        
    }
    const userExercises = {
        _id: userId,
        username: user.username,
        count: allExercises.length,
        log: allExercises.map((exercise) => ({
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString()
        }))
    }
    return res.json(userExercises);
})

// const newUser = async (userName) => {
//     const newUsername = new User({username: userName})
//     try {
//         await newUsername.save();
//         return newUsername;
//     } catch (err) {
//         console.log(err);
//         return null;
//     }
// }


app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`);
})