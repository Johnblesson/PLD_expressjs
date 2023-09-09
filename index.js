const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const UserLogin = require("./models/user");
const bcrypt = require("bcrypt");
const session= require('express-session');
const hbs = require('hbs');
const path = require('path');

const PORT = process.env.PORT || 8080

// Connect to the mongodb database
mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

// Check for connection
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => {
    console.log('Connected to database...')
})

//View engine
const templatePath = path.join(__dirname, './views');
app.set('view engine', 'hbs');
app.set('views', templatePath);
app.use(express.urlencoded({ extended: false }));

// Serving static files 'public
app.use(express.static('public'));


// Accept json
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.render('login')
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/home', (req, res) => {
    res.render('home')
})

// Signup route
app.post('/signup', async (req, res) => {
    try {
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const data = {
            username: req.body.username,
            password: hashedPassword,
        };

        await UserLogin.insertMany([data]);
        res.status(201).render('home');
    } catch (error) {
        res.status(501).send('An error occurred while signing up');
    }
})

// login route
app.post('/login', async(req, res) => {
    try{;
        const user = await UserLogin.findOne({ username: req.body.username });

        if(!user) {
            return res.send('User not found');
        }
        const passwordMatch = await bcrypt.compare(req.body.password, user.password)

        if(passwordMatch) {
            // req.session.user = user;
            res.status(201).render('home');
        } else {
            res.send('Incorrect password');
        }
    } catch (error){
        res.send('An error occurred while logging in');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

// Server
// Routes
// Database