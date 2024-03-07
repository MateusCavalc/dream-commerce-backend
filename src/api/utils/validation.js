module.exports = app => {
    function existsOrError(value, msgOnError) {
        // não existe value
        if (!value) throw msgOnError

        // É um array vazio
        if (Array.isArray(value) && value.length === 0) throw msgOnError

        // É uma string vazia
        if (typeof value === 'string' && !value.trim()) throw msgOnError
    }

    function notExistsOrError(value, msgOnError) {
        try {
            existsOrError(value, msgOnError)
        } catch (msg) {
            return
        }

        throw msgOnError
    }

    function equalsOrError(a, b, msgOnError) {
        if (a !== b) throw msgOnError
    }

    return { existsOrError, notExistsOrError, equalsOrError }
}