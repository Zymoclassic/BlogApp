// non-existing routes
const notFound = (req, res, next) => {
    res.status(404).json({ message: `The page - ${req.originalUrl} does not exist.` });
}

module.exports = { notFound };