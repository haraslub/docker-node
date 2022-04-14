"use strict"

const bcrypt = require("bcryptjs")
const {User} = require('../models/userModel')

exports.signUp = async (req, res) => {
    const {username, password} = req.body
    try {
        const hashPassword = await bcrypt.hash(password, 12)
        const newUser = await User.create({
            username: username,
            password: hashPassword,
        })
        req.session.user = newUser
        res.status(201).json({
            status: 'success',
            data: {
                user: newUser,
            }
        })
    } catch(e) {
        res.status(400).json({
            status: "fail"
        })
    }
}

exports.login = async (req, res) => {
    const {username, password} = req.body
    try {
        const user = await User.findOne({username})

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: `User ${username} not found.`
            })
        }

        const passwordIsCorrect = await bcrypt.compare(password, user.password)

        if (passwordIsCorrect) {
            // req.session (the way how to access our session) and we can add any property to our session, hence:
            // req.session.user (to create an user in our session) and assign the credentials, i.e. username and password;
            req.session.user = user
            res.status(200).json({
                status: "success",
                message: `Successful login of the user ${username}`
            })
        } else {
            res.status(400).json({
                status: "fail",
                message: `Incorrect password or username`
            })
        }
    } catch(e) {
        console.log(e)
        res.status(400).json({
            status: "fail"
        })
    }
}