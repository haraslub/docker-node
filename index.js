"use strict"

const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const redis = require("redis")
const cors = require("cors")

const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require('./config/config')

let RedisStore = require("connect-redis")(session)
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
})

const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

/**
 * to have app being able to handle situation if database is not connected
 */
const connectWitRetry = () => {
    mongoose
    .connect(mongoURL)
    .then(() => console.log("Successfully connected to DB"))
    .catch((e) => {
        console.log("Database connection error:")
        console.log(e)
        setTimeout(connectWitRetry, 5000)
    })
}

connectWitRetry()

app.enable("trust proxy") // to have express an access to IP address from nginx
app.use(cors({}))
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 3600000
    }
}))

app.use(express.json()) // to ensure that body gets to attach to the request object

app.get("/api/v1", (req, res) => {
    res.send("<h2>!!!Hi There!!!</h2>")
    console.log("It ran!!!") // to test nginx working properly
})

app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)

const port = process.env.PORT || 3000

app.listen(port, () => { console.log(`listening on port ${port}`) })