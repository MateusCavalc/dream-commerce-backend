const { upload } = require('../middlewares/MulterMiddleware')
const forAdmin = require('../middlewares/AdminMiddleware')

module.exports = app => {
    // ------
    // HEALTH
    // ------
    app.route('/health')
        .get(app.src.api.health.check)

    // -----
    // SIGNUP
    // -----
    app.route('/signup')
        .post(app.src.api.users.save)

    // -----
    // SIGNIN
    // -----
    app.route('/signin')
        .post(app.src.api.auth.login)

    // -----
    // TOKEN
    // -----
    app.route('/token/validate')
        .post(app.src.api.auth.tokenValidate)

    // -----
    // USERS
    // -----
    app.route('/users')
        .post(app.src.api.users.save)

    app.route('/users')
        .all(app.src.config.auth.passport.authenticate)
        .get(forAdmin(app.src.api.users.get))

    app.route('/users/names')
        .all(app.src.config.auth.passport.authenticate)
        .get(forAdmin(app.src.api.users.getUsersNames))

    app.route('/users/:id')
        .all(app.src.config.auth.passport.authenticate)
        .get(app.src.api.users.getById)
        .put(app.src.api.users.save)
        .delete(forAdmin(app.src.api.users.remove))

    app.route('/users/pswd/:id')
        .all(app.src.config.auth.passport.authenticate)
        .put(app.src.api.users.updatePassword)

    // --------
    // PRODUCTS
    // -------- 
    app.route('/products')
        .get(app.src.api.products.getAll)

    app.route('/products')
        .all(app.src.config.auth.passport.authenticate)
        .post(upload.any(), app.src.api.products.add)

    app.route('/products/:id')
        .all(app.src.config.auth.passport.authenticate)
        .put(upload.any(), app.src.api.products.update)
        .delete(app.src.api.products.remove)

}