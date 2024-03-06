const express = require('express')
const consign = require('consign')
const logger = require('./logger/logger')
const bootMongo = require('./config/db.mongo')

const PORT = 4000
const app = express()

logger.info('Starting server...')

bootMongo(app)

consign()
    .include('./src/config/middlewares.js')
    .then('./src/api')
    .then('./src/config/routes.js')
    .into(app)

app.listen(PORT, () => {
    logger.info(`Running on port ${PORT}`)
})