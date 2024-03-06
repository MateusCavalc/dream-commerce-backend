const mongoose = require("mongoose")
const logger = require('../logger/logger')
const { mongoConfig } = require('../../.env')

const mongoUrl = `mongodb://${mongoConfig.user}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`

const bootMongo = app => {
    logger.info(`[Mongo] Conectando em ${mongoUrl}`)


    mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: 1000,
        authSource: "admin",
    })
        .then(() => logger.info(`[Mongo] Conectado`))
        .catch(err => {
            logger.error('[Mongo] Não foi possível conectar!')
            if (err.message) logger.error(`[Mongo] ${err.message}`)
        })


    app.mongo = mongoose

}

module.exports = bootMongo