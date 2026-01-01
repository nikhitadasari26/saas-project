const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware'); // Protect routes

router.post('/:tenantId/users', auth, userController.addUser);
router.get('/:tenantId/users', auth, userController.listUsers);

// New Routes
router.put('/:tenantId/users/:userId', auth, userController.updateUser);
router.delete('/:tenantId/users/:userId', auth, userController.deleteUser);

// ADD THIS: Route for self-password update
router.put('/profile/update-password', auth, userController.updatePassword);

module.exports = router;