const express = require("express")
const Task = require("../models/task")
const auth = require("../middleware/auth")
const multer = require('multer')
const sharp = require("sharp")

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

// creating new task
router.post("/tasks", auth, upload.single("screenshot"), async (req, res) => {
    // const task = new Task(req.body)
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((error) => {
    //     res.status(400).send(error) // bad request
    // })

    // using async and await
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    req.body.screenshot = buffer
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// fetching all tasks 
// filtering - get /tasks?completed=true
// pagination - get /tasks?limit=10&skip
// sorting - get /tasks?sortBy=createdAt:asc
router.get("/tasks", auth, async (req, res) => {
    // Task.find({}).then(tasks => {
    //     res.send(tasks)
    // }).catch(error => {
    //     res.status(500).send()
    // })

    // using async and await
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === "true"
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }
    try {
        // const tasks = await Task.find({})
        // const tasks = await Task.find({owner:req.user._id})
        // this populate is used to get all tasks associated with a user
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

// fetching task by id
router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id
    // Task.findById(_id).then(task => {
    //     if (!task) {
    //         return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch(error => {
    //     res.status(500).send()
    // })

    // using async and await

    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

// update a task
router.patch("/tasks/:id", auth, async (req, res) => {
    // getting the array of properties client is trying to update
    const updates = Object.keys(req.body)
    // mentioning the properties client is allowed to update
    const allowedUpdates = ['description', 'completed']
    // checking if the correct properties are getting updated
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates" })
    }
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// delete a task
router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router