const express = require('express')
const consign = require('consign')
const logger = require('./logger/logger')
require('dotenv').config()

const bootPg = require('./config/databases/db.pg')
const bootMongo = require('./config/databases/db.mongo')

const path = require('path')

const app = express()

logger.info('Starting server...')

app.use(express.static(path.join(process.cwd(), process.env.STORAGE_IMAGES_PATH)))

app.use((req, _, next) => {
    logger.info(`${req.method} - ${req.path}`)
    next()
})

bootPg(app)
bootMongo(app)

consign()
    .include('./src/config/middlewares.js')
    .then('./src/api/utils')
    .then('./src/api')
    .then('./src/config/routes.js')
    .into(app)

app.listen(process.env.APP_PORT, () => {
    logger.info(`Running on port ${process.env.APP_PORT}`)
})