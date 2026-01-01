const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Get the token from the request header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    try {
        // Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded; // This adds {userId, tenantId, role} to the request
        next();
    } catch (ex) {
        res.status(401).json({ success: false, message: "Invalid token." });
    }
};

module.exports = authenticate;