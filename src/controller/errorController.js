export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    return res.status(err.statusCode).json({
        status: err.statusCode,
        error: err,
        message: err.message,
        stact: err.stack
    })
}