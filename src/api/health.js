const logger = require('../logger/logger')

module.exports = _ => {
    return {
        check: (req, res) => {
            logger.info(`${req.method} - ${req.path}`)

            res.status(200).json({
                status: 200,
                msg: "",
                data: {
                    alive: true
                }
            })
        }
    }
}