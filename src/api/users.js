const bcrypt = require('bcrypt-nodejs')
const { StatusCodes } = require('http-status-codes')

module.exports = app => {
    const {
        existsOrError,
        notExistsOrError,
        equalsOrError
    } = app.src.api.utils.validation

    const {
        successResponse,
        errorResponse
    } = app.src.api.utils.responses

    const encryptPassword = (password) => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    // criar ou atualizar usuário
    const save = async (req, res) => {
        const user = { ...req.body }

        // se o cadastro não é dado pela rota /users -> NÃO PODE SER ADMIN
        // if (!req.originalUrl.startsWith('/users')) user.admin = false
        // if (!req.user || !req.user.admin) user.admin = false

        // se for atualização do usuário
        if (req.params.id) {
            user.id = req.params.id

            // atualiza
            app.pg('users')
                .update(user)
                .where({ id: user.id })
                .then(() => successResponse(res, StatusCodes.NO_CONTENT, "Usuário atualizado", {}))
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? 'Não foi possível atualizar o usuário'))

        }
        else {
            // validações
            try {
                existsOrError(user.name, "Nome não informado.")
                existsOrError(user.email, "E-mail não informado.")
                existsOrError(user.password, "Senha não informada.")
                existsOrError(user.passwordConfirmation, "Confirmação de senha não informada.")
                equalsOrError(user.password, user.passwordConfirmation, 'Senhas fornecidas não são equivalentes.')

                const dbUser = await app.pg('users')
                    .where({ email: user.email })
                    .first()

                notExistsOrError(dbUser, "Usuário já cadastrado.")

            } catch (err) {
                // para qualquer erro, envia a resposta
                return errorResponse(res, StatusCodes.BAD_REQUEST, err)
            }

            user.password = encryptPassword(user.password)

            delete user.passwordConfirmation

            // cria
            app.pg('users')
                .insert(user)
                .then(() => successResponse(res, StatusCodes.CREATED, 'Usuário criado', user))
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? 'Não foi possível criar o usuário'))

        }

    }

    const updatePassword = (req, res) => {
        const user = { ...req.body }
        user.id = req.params.id

        try {
            existsOrError(user.password, "Nova Senha não informada.")
            existsOrError(user.passwordConfirmation, "Confirmação de nova senha não informada.")
            equalsOrError(user.password, user.passwordConfirmation, 'Senhas fornecidas não são equivalentes.')

            user.password = encryptPassword(user.password)

            delete user.passwordConfirmation

            app.pg('users')
                .update(user)
                .where({ id: user.id })
                .then(() => successResponse(res, StatusCodes.NO_CONTENT, "Usuário atualizado", {}))
                .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? 'Não foi possível atualizar a senha do usuário'))

        } catch (err) {
            // para qualquer erro, envia a resposta
            return errorResponse(res, StatusCodes.BAD_REQUEST, err)
        }
    }

    const get = (req, res) => {

        app.pg('users')
            .select('id', 'name', 'email', 'admin')
            .then(users => successResponse(res, StatusCodes.OK, '', users))
            .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? 'Não foi possível obter os usuários'))

    }

    const getUsersNames = (req, res) => {
        app.pg('users')
            .select('id', 'name')
            .then(userNames => successResponse(res, StatusCodes.OK, "", userNames))
            .catch(err => errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, err.message ?? "Não foi possível obter os nomes dos usuários", {}))
    }

    const getById = async (req, res) => {

        const userId = req.params.id

        const dbUser = await app.pg('users')
            .select('id', 'name', 'email', 'admin')
            .where({ id: userId })
            .first()

        if (!dbUser) {
            return errorResponse(res, StatusCodes.NOT_FOUND, "Usuário não encontrado", {})
        }

        return successResponse(res, StatusCodes.OK, '', dbUser)

    }

    const remove = async (req, res) => {

        const userId = req.params.id

        try {
            existsOrError(userId, "Código do usuário não informado.")

            const deletedRows = await app.pg('users')
                .where({ id: userId })
                .del()

            existsOrError(deletedRows, "Usuário não encontrado.")

            return successResponse(res, StatusCodes.NO_CONTENT, 'Usuário removido', {})

        } catch (err) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, err.message ?? 'Não foi possível deletar o usuários')
        }

    }

    return { save, updatePassword, get, getUsersNames, getById, remove }
}