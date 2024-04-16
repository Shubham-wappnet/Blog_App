require('dotenv').config();
const User = require('../models/userModel.js')
const Blog = require('../models/blogModel.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    try {
        const { email, name, phone, password } = req.body;
        const existUser = await User.findOne({ email: email })
        if (existUser) {
            return res.status(400).json({ error: "Email is already registered" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ email, name, phone, password: hashedPassword, blogs: [] })
        await newUser.save()

        // const d = new Date()
        // const hour = d.getHours()

        const token = jwt.sign({ email: newUser.email }, process.env.SECRET_KEY, {
            expiresIn: '2h'
        })
        newUser.password = undefined
        res.status(201).json({ token })

    }
    catch (error) {
        console.error('Error in signup controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" })
        }
        const isPassword = await bcrypt.compare(password, user.password)
        if (!isPassword) {
            return res.status(401).json({ error: "Invalid email or password" })
        }
        // const d = new Date()
        // const hour = d.getHours()

        const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
            expiresIn: '2h'
        })
        res.status(201).json({ MESSAGE: "User is logged in" })
    }
    catch (error) {
        console.error('Error in login controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('email name phone blogs')

        if (users) {
            res.status(200).send(users)
        }
        else {
            res.status(404).json({ MESSAGE: "Users not found" })
        }
    }
    catch (error) {
        console.error('Error occurred while fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getOneUser = async (req, res) => {
    try {
        const email = req.body.email;
        const getUser = await User.findOne({ email: email }).select('email name phone')
        if (getUser) {
            res.status(200).send(getUser)
        }
        else {
            res.status(404).json({ MESSAGE: "User not found" })
        }
    }
    catch (error) {
        console.error('Error occurred while fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getBlogByUserId = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId)
        if (!user) {
            res.status(404).json({ error: "User not found" })
        }
        const blogs = await Blog.find({ user: userId })
        if (blogs) {
            res.status(200).send(blogs)
        }
        else {
            res.status(404).json({ error: "Blogs not found" })
        }
    }
    catch (error) {
        console.error('Error in updateBlog controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = { signup, login, getUsers, getOneUser, getBlogByUserId }