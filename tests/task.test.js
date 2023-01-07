const request = require("supertest")
const { response } = require("../src/app")
const app = require("../src/app")
const Task = require("../src/models/task")
const { userOneId, userOne, setupDatabase, userTwoId, userTwo, taskOne, taskTwo, taskThree } = require("./fixtures/db")

beforeEach(setupDatabase)
test("Should create task for user", async () => {
    const response = await request(app).post("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "Writing tests"
        }).expect(201)

    // assert that task is created and complted value is by default false
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test("Should fetch user tasks", async () => {
    const response = await request(app).get("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .expect(200)

    // assert no of tasks
    expect(response.body.length).toEqual(2)
})

test("Should not delete other users task", async () => {
    await request(app).delete(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
        .expect(404)

    // assert the first task is in database
    const task = Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not create task with invalid description', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400)
})

test('Should delete user task', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(response.body._id)
    expect(task).toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not update other users task', async () => {
    await request(app)
        .patch(`/tasks/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: 'test not update other users task',
        })
        .expect(404)
})

test('fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
 
    expect(response.body.length).toEqual(1)
})