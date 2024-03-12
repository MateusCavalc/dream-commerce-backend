module.exports = (app) => {
    const successResponse = (res, status, msg, data) => {
        res.status(status).json({
            status,
            msg,
            data
        })
    }

    const errorResponse = (res, status, msg) => {
        res.status(status).json({
            status,
            msg,
            data: {}
        })
    }

    return { successResponse, errorResponse }
}