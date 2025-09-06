export const asyncHandler = (fn) =>  async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.Code || 500).json({
            success: false,
            message: error.message
        })
        console.log(error)
    }
}
