module.exports = app => {
    app.route('/health')
        .get(app.src.api.health.check)

    app.route('/products')
        .post(app.src.api.products.add)
        .get(app.src.api.products.getAll)
}