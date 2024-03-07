const { Schema } = require('mongoose')
const logger = require('../logger/logger')

module.exports = app => {

    const product = app.mongo.model('product',
        new Schema({
            name: String,
            description: String,
            price: Number,
            image: String,
            ownerId: String,
            categories: Array,
            createdAt: Date
        })
    )

    return {
        add: (req, res) => {
            logger.info(`${req.method} - ${req.path}`)

            const data = req.body

            const newProduct = new product({
                name: data.name,
                description: data.description,
                price: data.price,
                image: req.file.filename,
                categories: data.categories,
                createdAt: new Date()
            })

            newProduct.save()
                .then(doc => res.status(201).json({
                    status: 201,
                    msg: "Produto adicionado com sucesso",
                    data: {
                        id: doc._id,
                        name: doc.name,
                        description: doc.description,
                        price: doc.price,
                        image: doc.image,
                        categories: doc.categories,
                        createdAt: doc.createdAt
                    }
                }))
                .catch((err) => {
                    logger.error(`${err.message}`)
                    res.status(500).json({
                        status: 500,
                        msg: err.message ?? "Erro interno, consulte o log",
                        data: { ...err }
                    })
                })
        },
        getAll: (req, res) => {
            logger.info(`${req.method} - ${req.path}`)

            product.find({}, {
                "_id": 0,
                "__v": 0
            }, { sort: { 'createdAt': -1 } })
                .then(products => res.status(200).json({
                    status: 200,
                    msg: "",
                    data: [...products]
                }))
                .catch((err) => {
                    logger.error(`${err.message}`)
                    res.status(500).json({
                        status: 500,
                        msg: err.message ?? "Erro interno, consulte o log",
                        data: { ...err }
                    })
                })
        }
    }
}