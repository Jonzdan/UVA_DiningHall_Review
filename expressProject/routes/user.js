const express = require('express')
const { db } = require('../models/user')
const router = express.Router()
const userSchema = require('../models/user')
const crypto = require('crypto')

router.get('/', async(req, res)=> {
    //get account info from url param - or decide later
    const params = req.params
})


router.post('/register', async(req,res)=>{
    const data = req.body //should be reg form
    /* Validation Here */
    //authenticate(data)
    /* Saving to DB */
    try {
        //throw new Error()
        const existingUser$ = await userSchema.find({$or: [{email: data.email},{username: data.user}]})
        if (existingUser$ && Object.keys(existingUser$).length === 0) {
            const obj = {
                email: data.email,
                username: data.user,
                password: data.firstPass,
            }
            const newUser = new userSchema(obj)
            newUser.save()
            res.json("DONE")
        }
        else { //user already exists
            let code
            if (existingUser$.length > 1 || (existingUser$[0].email === data.email && existingUser$[0].username === data.user)) { //means email and username already taken
                code = "110"
            } else if (existingUser$[0].email === data.email) {
                code = "001"
            } else if (existingUser$[0].username === data.user) {
                code = "010"
            } else {
                console.log(data)
                throw new Error({msg: "Unknown Data"})
            }
            res.status(403).json({code:code})
        }
    }
    catch (err) {
        console.log(err)
    }
    
})

router.post('/login', async(req, res)=>{
    const data = req.body
    authenticate(data)
    const foundUser$ = await userSchema.find({username: data.user, password: data.password})
    if (foundUser$ && Object.keys(foundUser$).length === 1) {
        res.setHeader("Access-Control-Expose-Headers", "AuthToken") //seems unnecessary
        res.setHeader("Access-Control-Allow-headers", "AuthToken")
        res.header('AuthToken', crypto.randomBytes(64).toString('hex'))
        res.status(200).json({username: foundUser$[0].username}) //instead of using authtoken, or cookie, to validate requests coming in, or use an JWT
    }
    else {
        res.status(401).json({code:"01101111011101"})
    }
    
})


function authenticate(infoObj) {
}

function csrf(req, res) { //check req and res tokens match?

}

function validFields() {

}


module.exports = router

