const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

const { StatusCodes } = require('http-status-codes')

module.exports = app => {

    const {
        successResponse,
        errorResponse
    } = app.src.api.utils.responses

    const login = async (req, res) => {

        if (!req.body.email || !req.body.password) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, "Informe e-mail e senha", {})
        }

        try {

            const user = await app.pg('users')
                .where({ email: req.body.email })
                .first()

            // se não encontra o usuário
            if (!user) {
                return errorResponse(res, StatusCodes.NOT_FOUND, "Usuário não cadastrado", {})
            }

            // se as senhas não batem
            if (!bcrypt.compareSync(req.body.password, user.password)) {
                return errorResponse(res, StatusCodes.BAD_REQUEST, "E-mail e senha inválidos")
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

            return successResponse(res, StatusCodes.OK, "", { token, payload })

        } catch (err) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível realizar o login. Entre em contato.")
        }

    }

    const tokenValidate = async (req, res) => {

        // dev: force some delay to test loading gif
        await new Promise(done => setTimeout(() => done(), 2000));

        const userData = req.body

        try {
            if (!userData.token) {
                errorResponse(res, StatusCodes.BAD_REQUEST, "Token inválido")
            }

            const token = jwt.decode(userData.token, process.env.AUTH_SECRET)

            // ainda está válido?
            if (new Date(token.exp * 1000) > new Date()) {
                return successResponse(res, StatusCodes.OK, "", {})
            }

        } catch (err) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, err.message ?? "Token inválido ou expirado.")
        }
    }

    return { login, tokenValidate }
}