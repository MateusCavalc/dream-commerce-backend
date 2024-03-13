const { upload } = require('../config/fileUpload')

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
    // USERS
    // -----
    app.route('/users')
        .post(app.src.api.users.save)
        .get(app.src.api.users.get)

    app.route('/users/names')
        .get(app.src.api.users.getUsersNames)

    app.route('/users/:id')
        .get(app.src.api.users.getById)
        .put(app.src.api.users.save)
        .delete(app.src.api.users.remove)

    app.route('/users/pswd/:id')
        .put(app.src.api.users.updatePassword)

    // --------
    // PRODUCTS
    // -------- 
    app.route('/products')
        .post(upload.any(), app.src.api.products.add)
        .get(app.src.api.products.getAll)

    app.route('/products/:id')
        .put(upload.any(), app.src.api.products.update)
        .delete(app.src.api.products.remove)

}