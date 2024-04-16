require('dotenv').config();
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const validateData = require('./middlewares/validation.js')
const authenicateJwt = require('./middlewares/authentication.js')
const port = process.env.PORT || 8000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/validate', validateData, (req, res) => {
    res.json({ MESSAGE: "user is validated successfully" })
})
app.get('/auth', authenicateJwt, (req, res) => {
    res.json({ MESSAGE: "protected route", email: req.email })
})

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("connected with db"))
    .catch((err) => console.log(err))

const router1 = require('./routes/userRouter.js')
app.use('/api/users', router1)

const router2 = require('./routes/blogRouter.js')
app.use('/api/blogs', router2)

const corOption = { origin: "https://localhost:3000" }
app.use(cors(corOption))

app.get('/', cors(corOption), (req, res) => {
    res.send("this is a cors enable process")
})

app.listen(port, function () {
    console.log(`Server is running on port ${port}`)
})

