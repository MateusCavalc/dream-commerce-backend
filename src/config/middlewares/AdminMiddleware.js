const { errorResponse } = require('../../api/utils/responses')()
const { StatusCodes } = require('http-status-codes')

// middleware for admin autorization
// receives a middleware for admin check
module.exports = (mid) => {
    return (req, res, next) => {
        if (req.user.admin) {
            mid(req, res, next)
        } else {
            return errorResponse(res, StatusCodes.FORBIDDEN, "Acesso exclusivo para administrador", {})
        }
    }
}