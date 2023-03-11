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
const userSchema = require('./models/user')
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

app.post("/authConfirm", async (req, res)=> {
    if (Object.keys(req.body).length !== 0) res.status(402).end()
    if (req.cookies.CSRF_TOKEN !== undefined) { //its in cookies since its a get request
        if (req.signedCookies.SESSION_ID === undefined) {
            res.status(400).json("Unauthorized")
        }
        else {
            const response = await tokenSchema.find({session_token: req.signedCookies.SESSION_ID, csrf_token: req.cookies.CSRF_TOKEN})
            if (Object.keys(response).length === 0 || Object.keys(response).length > 1) { res.status(400).end('Error Detected') }
            else {
                const user = response[0].userID
                //generate new session and csrf token
                const csrf = await updateCSRF()
                let session = crypto.randomBytes(128).toString('hex')
                let exists = await tokenSchema.find({session_token: session}) //change to pull all records when app gets big
                while (Object.keys(exists).length > 0) {
                    session = crypto.randomBytes(128).toString('hex')
                    exists = await tokenSchema.find({session_token: session})
                }
                await tokenSchema.findOneAndUpdate({userID: user}, {session_token: session, csrf_token: csrf})
                const person = await userSchema.find({_id: user}); if (Object.keys(person).length === 0) { res.status(401).end() }
                res.cookie('SESSION_ID', session, {sameSite: 'strict', httpOnly: true, maxAge: 1000*60*60*6, signed: true})
                res.cookie('CSRF_TOKEN', csrf, {sameSite: 'strict', maxAge: 1000*60*60*6, expires:1000*60*60*6})
                res.status(200).json({username: person[0].username})
            }

        } 
    } else {
        const csrf = await updateCSRF()
        res.header('Content-Security-Policy', "default-src 'self'; style-src 'self', 'unsafe-inline'") //??
        res.cookie('CSRF_TOKEN', csrf, {sameSite: 'strict', maxAge: 1000*60*60*6, expires: 1000*60*60*6})
        res.status(200).json('1110111')
        
    }
})

async function updateCSRF() {
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
    return csrf
}

app.use('/api/runk', apirunk)
app.use('/api/ohill', apiohill)
app.use('/api/newcomb', apinewcomb)
app.use('/user', userAuth)

app.listen(process.env.PORT || 4000)

