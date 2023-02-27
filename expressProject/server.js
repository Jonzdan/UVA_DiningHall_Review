require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
const https = require('https')
const fs = require('fs')
const { maxHeaderSize } = require('http')
const writeStream = fs.createWriteStream('info.csv')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
const mongoose = require('mongoose')
const { remove } = require('./models/runk.js')
const apirunk = require('./routes/api/runk') //add again when db is rdy to go
const apiohill = require('./routes/api/ohill')
const apinewcomb = require('./routes/api/newcomb')
const userAuth = require('./routes/user')

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected'))

app.use(express.static('public'))
app.use(express.json())
app.use(session({ //change secret to something more substantial later (dotenv), and add session to db later
    secret: "temp",
    name: 'session-id',
    saveUninitialized: false,
    cookie: { maxAge: 1000 },
    resave: false,
}))
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.get("/", (req, res) => { //this should be initial request that is sent...

    res.sendFile('./views/index.html', {root: __dirname})
    
})

app.get("/getCSRFToken", (req, res)=> {
    if (req.headers.H_CSRF_TOKEN) {
        res.status(400).json("Unauthorized")
    } else {
        //does not exist
        //store csrf_token in database, but now session is alright
        req.session.csrf_token = crypto.randomBytes(64).toString('hex')
        res.cookie('CSRF_TOKEN', req.session.csrf_token, {sameSite: 'strict'})
        res.status(200).json(null)
    }
})

app.use('/api/runk', apirunk)
app.use('/api/ohill', apiohill)
app.use('/api/newcomb', apinewcomb)
app.use('/user', userAuth)

app.listen(process.env.PORT || 4000)

