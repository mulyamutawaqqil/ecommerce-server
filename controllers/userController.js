const {User} = require("../models")
const {comparePassword} = require("../helpers/bcrypt")
const {generateToken} = require("../helpers/jwt")

class userController {
    static login(req, res, next) {
        const {email, password} = req.body
        if (!email || !password) {
            next({name: 'EmptyInput'})
        }
        User.findOne({where: {email}})
        .then(user => {
            if (!user) {
                next({name: "ResourceNotFound"})
            } else {
                let match = comparePassword(password, user.password)
                if (!match) {
                    next({name: "ResourceNotFound"})
                } else {
                    const {id, email} = user
                    const access_token = generateToken({id, email})
                    res.status(200).json({access_token})
                }
            }
        })
        .catch(err => {
            next(err)
        })
        
    }
}

module.exports = userController