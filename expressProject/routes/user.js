const express = require('express')
const { db } = require('../models/user')
const router = express.Router()
const userSchema = require('../models/user')
const crypto = require('crypto')
const { csrf } = require('../auth')

router.use(csrf)

router.get('/', async(req, res)=> {
    //get account info from url param - or decide later
    const params = req.params
})


router.post('/register', async(req,res)=>{
    const data = req.body //should be reg form
    /* Validation Here */
    //console.log(req.cookies, req.cookies.CSRF_TOKEN)
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
    const foundUser$ = await userSchema.find({username: data.user, password: data.password})
    if (foundUser$ && Object.keys(foundUser$).length === 1) { //send sessionID, authentication Token
        await userSchema.findOneAndUpdate({username: foundUser$[0].username, password: foundUser$[0].password}, {csrfToken: req.headers.h_csrf_token}) //fix sessionId
        res.status(200).json({username: foundUser$[0].username}) //instead of using authtoken, or cookie, to validate requests coming in, or use an JWT... associate CSRF with user upon login
        //we use the sessionid to determine if its from the right csrf, which is why we link the csrf to a user
        //so if there is a sessionid, we remove this login path, same with register
    }
    else {
        res.status(401).json({code:"01101111011101"})
    }
    
})


function authenticate(infoObj) {

}



function validFields() {

}


module.exports = router

