const mongoose = require("mongoose")
const logger = require('../../logger/logger')

const mongoUrl = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PSWD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`

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