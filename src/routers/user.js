const express = require("express")
const User = require("../models/user")
const auth = require("../middleware/auth")
const multer = require("multer")
const sharp = require("sharp")
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')

const router = express.Router()
// configuring multer
const upload = multer({
    /* dest: 'avatar',*/
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload image only"))
        }
        cb(undefined, true)
    }
})

// creating new user
router.post("/users", async (req, res) => {
    const user = new User(req.body)
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((error)=>{
    //     res.status(400).send(error) // bad request
    // })

    // using async await here

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }

})

// Log in
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//log out
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// log out from all sessions
router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// fetching all users
// commenting out because client shouldn't fetch all the users
// router.get("/users", auth, async (req, res) => {
//     // User.find({}).then(users=>{
//     //     res.send(users)
//     // }).catch(error=>{
//     //     res.status(500).send()
//     // })

//     // using async await here

//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// user profile
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user)
})

// fetch a particular user by id
// don't need because we have show profile endpoint above and one user can't see another user's data by their id
// router.get("/users/:id", async (req, res) => {
//     const _id = req.params.id
//     // User.findById(_id).then(user => {
//     //     if (!user) {
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)
//     // }).catch(error => {
//     //     res.status(500).send()
//     // })

//     //using async and await

//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// update an user
router.patch("/users/me", auth, async (req, res) => {
    // getting the array of properties client is trying to update
    const updates = Object.keys(req.body)
    // mentioning the properties client is allowed to update
    const allowedUpdates = ['name', 'email', 'age', 'password']
    // checking if the correct properties are getting updated
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates" })
    }
    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        // const user = await User.findById(req.params.id)
        // updates.forEach(update => user[update] = req.body[update])
        // await user.save()
        // if (!user) {
        //     return res.status(404).send()
        // }
        // res.send(user)
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// delete an user
router.delete("/users/me", auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        // res.send(user)
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

// upload image
router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
    // req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// delete profile image
router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// fetching user profile image
router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.send(404).send()
    }
})

module.exports = router