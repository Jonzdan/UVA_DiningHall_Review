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

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection

db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected'))



app.use(express.static('public'))
app.use(express.json())
app.use(session({ //change secret to something more substantial later (dotenv)
    secret: "temp",
    name: 'session-id',
    saveUninitialized: false,
    cookie: { maxAge: 1000*60*60*24 },
    resave: false
}))
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())


const runktimeStations = {
    "7am-10:30am" : ["Copper Hood", "Entree", "Sustainable World", "Street Food Grill","Juicery","Chobani Creations", "Delicatessen", "Grit and Oatmeal Bar"],
    "11am-2pm" : ["Copper Hood", "Entree", "Sustainable World", "Oven", "Plant Power", "Plant Power Grill", "Street Food Grill", "Self-Serve Grill Toppings", "Juicery", "Chobani Creations", "Delicatessen", "Produce Market"],
    "2pm-4:30pm" : ["Sustainable World", "Oven", "Plant Power", "Plant Power Grill", "Juicery", "Chobani Creations", "Delicatessen", "Produce Market"],
    "4:30pm-8pm" : ["Copper Hood", "Entree", "Sustainable World", "Oven", "Plant Power", "Plant Power Grill", "Street Food Grill", "Self-Serve Grill Toppings", "Juicery", "Chobani Creations", "Delicatessen", "Produce Market"],
    "9pm-12am" : ["Late Night Grill"]
}


app.get("/", (req, res) => {
    //console.log(req.cookies)
    if (req.cookies.length == 0) {
        //req.session.change = 'hi'
        res.sendFile('./views/index.html', {root: __dirname})
    }
    else {
        res.sendFile('./views/signin.html', {root: __dirname})
    }
    
})

app.use('/api/runk', apirunk)
app.use('/api/ohill', apiohill)
app.use('/api/newcomb', apinewcomb)

app.get("/signup", (req,res)=>{
    res.sendFile('./views/signup.html', {root: __dirname})
})

app.listen(process.env.PORT || 4000)
