const isolateTenant = (req, res, next) => {
    if (req.user.role === 'super_admin') return next();
    
    // Force the tenantId from the token into the request params/body
    req.tenantId = req.user.tenantId;
    next();
};
