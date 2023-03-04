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
const tokenSchema = require('./models/token')
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
app.use(cookieParser('5123cnnasdh'))
app.get("/", (req, res) => { //this should be initial request that is sent...

    res.sendFile('./views/index.html', {root: __dirname})
    
})

app.get("/getCSRFToken", async (req, res)=> {
    if (req.cookies.CSRF_TOKEN !== undefined) { //its in cookies since its a get request
        res.status(400).json("Unauthorized")
    } else {
        let csrf = crypto.randomBytes(64).toString('hex')
        let exists = await tokenSchema.find({csrf_token: csrf})
        while (Object.keys(exists).length > 0) {
            csrf = crypto.randomBytes(64).toString('hex')
            exists = await tokenSchema.find({csrf_token: csrf})
        }
        const obj = {
            csrf_token: csrf,
        }
        const newToken = new tokenSchema(obj)
        await newToken.save()
        res.header('Content-Security-Policy', "default-src 'self'; style-src 'self', 'unsafe-inline'") //??
        res.cookie('CSRF_TOKEN', csrf, {sameSite: 'strict', maxAge: 1000*60*60*24, expires: 1000*60*60*24})
        res.status(200).json(null)
        
    }
})

app.use('/api/runk', apirunk)
app.use('/api/ohill', apiohill)
app.use('/api/newcomb', apinewcomb)
app.use('/user', userAuth)

app.listen(process.env.PORT || 4000)

