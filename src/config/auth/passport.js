const passport = require('passport')
const { Strategy, ExtractJwt } = require('passport-jwt')

const { StatusCodes } = require('http-status-codes')

module.exports = app => {

    const { errorResponse } = app.src.api.utils.responses

    // params for jwt
    const params = {
        secretOrKey: process.env.AUTH_SECRET,
        // jwt from headers ( Authentication: bearer [token] )
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    }

    // create strategy with params
    const strategy = new Strategy(params, (payload, done) => {
        // code only executes if token is a valid one !!!
        app.pg('users')
            .where({ id: payload.id })
            .first()
            .then(user => {
                // null -> no error
                // e and return the user from payload
                done(null, user ?
                    {
                        id: payload.id,
                        email: payload.email,
                        admin: payload.admin,
                    } : false)
            })
            .catch(err => {
                done(err, false)
            })
    })

    // set passport to use the custom strategy
    passport.use(strategy)

    return {
        // middleware for authetication with passport
        authenticate: (req, res, next) => {
            passport.authenticate('jwt', { session: false }, (err, user) => {
                // if error of no user
                if (err || !user) {
                    return errorResponse(res, StatusCodes.UNAUTHORIZED, "", {})
                }

                // set user in req to use in api routes
                req.user = user

                // continue the route flow
                next()
            })(req, res, next)
        }
    }
}