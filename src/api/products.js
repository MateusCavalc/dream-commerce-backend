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
            categories: Array,
            createdAt: Date
        })
    )

    return {
        getAll: (req, res) => {
            product.find({}, {
                "__v": 0,
                "createdAt": 0
            }, { sort: { 'createdAt': -1 } })
                .then(products => successResponse(res, StatusCodes.OK, "", products))
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível obter os produtos", {}))
        },
        add: (req, res) => {

            // if no given image
            if (!req.files || req.files.length === 0) {
                return errorResponse(res, StatusCodes.BAD_REQUEST, 'Imagem não fornecida', {})
            }

            const data = req.body

            const storageFilename = `${data.ownerId}-${req.files[0].originalname}`

            const newProduct = new product({
                _id: new mongoose.Types.ObjectId(),
                name: data.name,
                description: data.description,
                price: data.price,
                image: storageFilename,
                ownerId: data.ownerId,
                categories: data.categories,
                createdAt: new Date()
            })

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
                        errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível salvar a imagem do produto", {})
                    }

                })
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível criar o produto", {}))
        },
        update: async (req, res) => {
            const productId = req.params.id
            const data = req.body

            // if a image was upload, nedd to update image in storage
            if (req.files && req.files.length > 0) {
                try {
                    const doc = await product.findById(productId, { _id: 0, image: 1 })

                    if (!doc) {
                        return errorResponse(res, StatusCodes.NOT_FOUND, "Produto não encontrado", {})
                    }

                    const basePath = `${process.cwd()}/${process.env.STORAGE_IMAGES_PATH}`
                    const newFilename = `${data.ownerId}-${req.files[0].originalname}`
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
                    return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível encontrar o produto", {})
                }
            }

            product.findOneAndUpdate({ _id: productId }, data, {})
                .then(() => successResponse(res, StatusCodes.NO_CONTENT, "Produto atualizado", {}))
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível atualizar o produto", {}))

        },
        remove: async (req, res) => {
            const productId = req.params.id

            try {
                const doc = await product.findById(productId, { _id: 0, image: 1 })

                if (!doc) {
                    return errorResponse(res, StatusCodes.NOT_FOUND, "Produto não encontrado", {})
                }

                product.deleteOne({ _id: productId })
                    .then(() => {
                        try {
                            fs.unlinkSync(`${process.cwd()}/${process.env.STORAGE_IMAGES_PATH}/${doc.image}`);

                            successResponse(res, StatusCodes.NO_CONTENT, "Produto removido", {})

                        } catch (err) {
                            if (err && err.code == 'ENOENT') {
                                // file doens't exist
                                errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Erro interno - A imagem do produto não foi encontrada. Requer suporte!", {})
                            } else {
                                errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível remover a imagem do produto", {})
                            }
                        }

                    })
                    .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível remover o produto", {}))
            }
            catch (err) {
                errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível remover o produto", {})
            }
        }

    }
}