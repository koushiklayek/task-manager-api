const mongoose = require("mongoose")
// const validator = require("validator")

mongoose.connect(process.env.MONGOOSE_URL)

// creating a user table and inserting document

// const User = mongoose.model("User", {
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     age: {
//         type: Number,
//         default: 0,
//         validate(value) {
//             if (value < 0)
//                 throw new Error("Age must be a positive number")
//         }
//     },
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true,
//         validate(value) {
//             if (!validator.isEmail(value))
//                 throw new Error("Email is invalid")
//         }
//     },
//     password: {
//         type: String,
//         required: true,
//         trim: true,
//         minLength: 7,
//         validate(value) {
//             if (value.toLowerCase().includes("password"))
//                 throw new Error("Password shouldn't contain word 'password'")
//         }
//     }
// })

// const me = new User({
//     name: "Koushik",
//     age: 21,
//     email: "layek@gmail.com",
//     password: "mypass123"
// })

// me.save().then(result => {
//     console.log(result)
// }).catch(error => {
//     console.log("Error", error)
// })

// challenge code

// const Task = mongoose.model("Task", {
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     }
// })

// const task = new Task({
//     description: "Writing Code",
//     completed: false
// })

// task.save().then(result => {
//     console.log(result)
// }).catch(error => {
//     console.log("Error", error)
// })