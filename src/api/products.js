const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const fs = require('fs')

module.exports = app => {

    const {
        successResponse,
        errorResponse
    } = app.src.api.utils.responses

    const product = app.mongo.model('product',
        new mongoose.Schema({
            _id: mongoose.Types.ObjectId,
            name: String,
            description: String,
            price: Number,
            image: String,
            ownerId: String,
            categories: [String],
            createdAt: Date
        })
    )

    return {
        get: async (req, res) => {

            const perPage = req.query.perPage || 6
            const page = req.query.page || 1

            const filter = {}

            // if query contains filter for categories, add it
            if (req.query.filter) {
                filter.categories = {
                    "$all": req.query.filter.split(',')
                }
            }

            const count = parseInt((await product.countDocuments(filter)))

            product.find(filter, {
                "__v": 0,
                "createdAt": 0
            }, {
                skip: perPage * (page - 1),
                limit: perPage,
                sort: {
                    'createdAt': -1
                }
            })
                .then(paginated => successResponse(res, StatusCodes.OK, "", {
                    products: paginated,
                    page: page,
                    perPage: perPage,
                    total: count
                }))
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível obter os produtos"))
        },
        add: (req, res) => {

            // if no given image
            if (!req.files || req.files.length === 0) {
                return errorResponse(res, StatusCodes.BAD_REQUEST, 'Imagem não fornecida', {})
            }

            const data = req.body

            const productId = new mongoose.Types.ObjectId()

            const storageFilename = `${productId}-${req.files[0].originalname}`

            const newProduct = new product({
                _id: productId,
                name: data.name,
                description: data.description,
                price: data.price,
                image: storageFilename,
                ownerId: data.ownerId,
                categories: data.categories.split(','),
                createdAt: new Date()
            })

            console.log(newProduct)

            newProduct.save()
                .then(doc => {
                    try {
                        fs.writeFileSync(`${process.cwd()}/${process.env.STORAGE_IMAGES_PATH}/${storageFilename}`, req.files[0].buffer, 'ascii');

                        successResponse(res, StatusCodes.CREATED, "Produto criado",
                            {
                                id: doc._id,
                                name: doc.name,
                                description: doc.description,
                                price: doc.price,
                                image: doc.image,
                                categories: doc.categories,
                                createdAt: doc.createdAt
                            })

                    } catch (err) {
                        errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível salvar a imagem do produto")
                    }

                })
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível criar o produto"))
        },
        update: async (req, res) => {
            const productId = req.params.id
            const data = req.body

            console.log(data)

            if (!data.categories) {
                return errorResponse(res, StatusCodes.BAD_REQUEST, 'O produto precisa de pelo menos uma categoria', {})
            }

            data.categories = data.categories.split(',')

            // if a image was upload, need to update image in storage
            if (req.files && req.files.length > 0) {
                try {
                    const doc = await product.findById(productId, { _id: 1, image: 1 })

                    if (!doc) {
                        return errorResponse(res, StatusCodes.NOT_FOUND, "Produto não encontrado")
                    }

                    const basePath = `${process.cwd()}/${process.env.STORAGE_IMAGES_PATH}`
                    const newFilename = `${doc._id}-${req.files[0].originalname}`
                    const oldImagePath = `${basePath}/${doc.image}`
                    const newImagePath = `${basePath}/${newFilename}`

                    // remove old product image from local storage
                    fs.unlinkSync(oldImagePath);

                    // add nel prodcut image
                    fs.writeFileSync(newImagePath, req.files[0].buffer, 'ascii');

                    // if all could be done without error, set data.image to update product model
                    data.image = newFilename

                }
                catch (err) {
                    return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível encontrar o produto")
                }
            }

            product.findOneAndUpdate({ _id: productId }, data, {})
                .then(() => successResponse(res, StatusCodes.NO_CONTENT, "Produto atualizado", {}))
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível atualizar o produto"))

        },
        remove: async (req, res) => {
            const productId = req.params.id

            try {
                const doc = await product.findById(productId, { _id: 0, image: 1 })

                if (!doc) {
                    return errorResponse(res, StatusCodes.NOT_FOUND, "Produto não encontrado")
                }

                product.deleteOne({ _id: productId })
                    .then(() => {
                        try {
                            fs.unlinkSync(`${process.cwd()}/${process.env.STORAGE_IMAGES_PATH}/${doc.image}`);

                            successResponse(res, StatusCodes.NO_CONTENT, "Produto removido", {})

                        } catch (err) {
                            if (err && err.code == 'ENOENT') {
                                // file doens't exist
                                errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Erro interno - A imagem do produto não foi encontrada. Requer suporte!")
                            } else {
                                errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível remover a imagem do produto")
                            }
                        }

                    })
                    .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível remover o produto"))
            }
            catch (err) {
                errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível remover o produto")
            }
        }

    }
}