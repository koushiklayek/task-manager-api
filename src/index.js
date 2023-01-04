const express = require("express")
const app = express()
require("./db/mongoose")
const userRouter=require("./routers/user")
const taskRouter=require("./routers/task")

const port = process.env.PORT

// parse the coming json data to object
app.use(express.json())
// use router
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log("Server is up and running on port", port)
})