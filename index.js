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
        const userId = req.body[':_id'], description = req.body.description,
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
            date: exercise.date, duration: exercise.duration, desciption: exercise.description })
    } catch (err) {
        console.log("somethig bad happend");
        console.log(err);
        return res.json({error: "not saved!"})
        
    }
    
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