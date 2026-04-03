import jwt from "jsonwebtoken";

// Optional auth — sets req.id if a valid client token is present, but never blocks the request
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decode = jwt.verify(token, process.env.SECRET_KEY);
            if (decode?.userId) {
                req.id = decode.userId;
            }
        }
    } catch (_) {
        // Invalid or expired token — just ignore, don't block
    }
    next();
};

export default optionalAuth;
