const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')
const logger = require('../logger/logger')

module.exports = app => {

    const login = async (req, res) => {
        logger.info(`${req.method} - ${req.path}`)

        if (!req.body.email || !req.body.password) {
            return res.status(400)
                .json({
                    status: 400,
                    msg: "Informe e-mail e senha.",
                    data: {}
                })
        }

        try {

            const user = await app.pg('users')
                .where({ email: req.body.email })
                .first()

            // se não encontra o usuário
            if (!user) {
                return res.status(404)
                    .json({
                        status: 404,
                        msg: "Usuário não cadastrado.",
                        data: {}
                    })
            }

            // se as senhas não batem
            if (!bcrypt.compareSync(req.body.password, user.password)) {
                return res.status(401)
                    .json({
                        status: 401,
                        msg: "E-mail e senha inválidos.",
                        data: {}
                    })
            }

            const now = Math.floor(Date.now() / 1000)
            const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                admin: user.admin,
                iat: now, // iat = issued at
                exp: now + parseInt(process.env.AUTH_EXPIRATION_IN_SECONDS)
            }

            const token = jwt.encode(payload, process.env.AUTH_SECRET)

            return res.status(200)
                .json({
                    status: 200,
                    msg: "",
                    data: {
                        token,
                        payload
                    }
                })

        } catch (error) {
            return res.status(400)
                .json({
                    status: 400,
                    msg: "Não foi possível realizar o login. Entre em contato.",
                    data: error
                })
        }

    }

    const validadeToken = async (req, res) => {
        logger.info(`${req.method} - ${req.path}`)

        const userData = req.body

        try {
            if (!userData.token) {
                return res.status(400)
                    .json({
                        status: 400,
                        msg: "Token inválido",
                        data: {
                            auth: false
                        }
                    })
            }

            const token = jwt.decode(userData.token, process.env.AUTH_SECRET)

            // ainda está válido?
            if (new Date(token.exp * 1000) > new Date()) {
                return res.status(200)
                    .json({
                        status: 200,
                        msg: "Token válido.",
                        data: {
                            auth: true
                        }
                    })
            }

        } catch (error) {
            return res.status(400)
                .json({
                    status: 400,
                    msg: error.message ? error.message : "Token inválido ou expirado.",
                    data: {
                        auth: false
                    }
                })
        }
    }

    return { login, validadeToken }
}