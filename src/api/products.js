const { Schema } = require('mongoose')
const { StatusCodes } = require('http-status-codes')

module.exports = app => {

    const {
        successResponse,
        errorResponse
    } = app.src.api.utils.responses

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

            const data = req.body

            console.log(data)

            const newProduct = new product({
                name: data.name,
                description: data.description,
                price: data.price,
                image: req.file.filename,
                ownerId: data.ownerId,
                categories: data.categories,
                createdAt: new Date()
            })

            newProduct.save()
                .then(doc => successResponse(res, StatusCodes.CREATED, "Produto criado",
                    {
                        id: doc._id,
                        name: doc.name,
                        description: doc.description,
                        price: doc.price,
                        image: doc.image,
                        categories: doc.categories,
                        createdAt: doc.createdAt
                    })
                )
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível criar o produto", {}))
        },
        getAll: (req, res) => {
            product.find({}, {
                "__v": 0,
                "createdAt": 0
            }, { sort: { 'createdAt': -1 } })
                .then(products => successResponse(res, StatusCodes.OK, "", products))
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível obter os produtos", {}))
        },
        remove: (req, res) => {
            const productId = req.params.id

            product.deleteOne({ _id: productId })
                .then(() => successResponse(res, StatusCodes.NO_CONTENT, "Produto removido", {}))
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível obter os produtos", {}))
        }
    }
}