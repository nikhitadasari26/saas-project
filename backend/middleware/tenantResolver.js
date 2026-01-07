const { Tenant } = require('../models');
const { Op } = require('sequelize');

const tenantResolver = async (req, res, next) => {
    try {
        const hostname = req.hostname;

        // This is a simple regex to extract a subdomain.
        // It assumes the domain is something like `sub.domain.com` or `sub.localhost`.
        // It might need to be adjusted for more complex domain structures.
        const subdomainMatch = hostname.match(/^[a-zA-Z0-9-]+(?=\.)/);

        // Handle cases where subdomain is the domain itself e.g. localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            req.tenant = null;
            return next();
        }

        const subdomain = subdomainMatch ? subdomainMatch[0] : null;

        // Ignore 'www' and other common non-tenant subdomains if necessary
        if (!subdomain || subdomain === 'www') {
            // No subdomain, proceed. Could be a super_admin or a call to the main site.
            req.tenant = null;
            return next();
        }

        const tenant = await Tenant.findOne({ where: { subdomain: { [Op.iLike]: subdomain } } });

        if (!tenant) {
            // It's important to decide what to do here.
            // Redirect to a "not found" page, or send a 404?
            // For an API, 404 is appropriate.
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }

        req.tenant = tenant;
        next();
    } catch (error) {
        console.error('TENANT RESOLVER ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error while resolving tenant.' });
    }
};

module.exports = tenantResolver;
