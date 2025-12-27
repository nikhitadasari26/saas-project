const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_test_secret');
        
        // Add user and tenantId to request object
        req.user = decoded;
        // Inside your auth middleware function
        if (req.params.tenantId && req.params.tenantId !== decoded.tenantId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access Denied: You cannot access another tenant\'s data' 
            });
        }
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};

module.exports = auth;