/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  register: async function (req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.badRequest({ error: 'Email and password are required.' });
    }
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ email, password: hashedPassword }).fetch();
      return res.status(201).json({ message: 'User created successfully.', user });
    } catch (error) {
      sails.log.error('User registration error:', error);
      return res.serverError({ error: 'Error creating user.', details: error.message });
    }
  },

  login: async function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.badRequest({ error: 'Email and password are required.' });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.notFound({ error: 'User not found.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.forbidden({ error: 'Invalid credentials.' });
      }

      const jwtSecret = sails.config.custom.JWT_SECRET;
      if (!jwtSecret) {
        sails.log.error('JWT_SECRET is not configured');
        return res.serverError({ error: 'Authentication configuration error' });
      }

      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
      return res.ok({ message: 'Login successful.', token });
    } catch (error) {
      sails.log.error('Login error:', error);
      return res.serverError({ error: 'Error logging in.', details: error.message });
    }
  },

  validate: async function (req, res) {
    // If the request reaches here through the isAuthenticated policy,
    // the token is valid and we can just return success
    return res.ok({ 
      message: 'Token is valid', 
      user: { id: req.user.id } 
    });
  }
};

