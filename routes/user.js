const express = require("express")
const { signup, signin, signout, editUser, editUserProfileImg } = require("../controllers/user")
const { addProperty, editProperty, editAdminProperty, deleteProperty, deleteAdminProperty } = require("../controllers/property")
const { requireAuth, requireAdmin, checkUser } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {check} = require('express-validator')
const Property = require("../models/property")
const User = require("../models/user")
const router = express.Router()

// Check User GET method - Allows access to current user information through app.locals.user
router.get('/*', checkUser);

// Register GET method - Renders the registration page
router.get('/signup', (req, res) => {
  return res.render('signup');
});

// Admin GET method - Renders the admin page
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try{
    const properties = await Property.find({})
    const users = await User.find({})
    res.render('admin', {
      properties: properties,
      users: users,
      firstName: res.app.locals.user.firstName,
      lastName: res.app.locals.user.lastName,
      id: res.app.locals.user.id
    })
  } catch(error) {
  console.log(error)
    res.redirect('/')
  }
});

// Edit Property GET method
router.put('/admin/:propertyId', requireAuth, requireAdmin, [
  check("dateOfPurchase", "Date cannot be empty").isDate(),
  check("price", "Price cannot be more than 10 digits").isLength({max: 10}),
  check("price", "Price cannot be empty").isLength({min: 1}),
  check("price", "Price can only be a number").isInt(),
  check("address", "Address cannot be more than 50 characters").isLength({max: 50}),
  check("address", "Address cannot be empty").isLength({min: 1}),
  check("zipCode", "Zip Code can only be a number").isInt(),
  check("zipCode", "Zip Code cannot be more than 10 digits").isLength({max: 8}),
  check("zipCode", "Zip Code cannot be empty").isLength({min: 1})
], editAdminProperty);

// Delete Property GET method
router.delete('/admin/:propertyId', requireAuth, requireAdmin, deleteAdminProperty);

// Register POST method - Handles registration
router.post('/signup', [
  check("firstName", "First name should be at least 3 characters").isLength({min: 3}),
  check("firstName", "First name should be less than 32 characters").isLength({max: 32}),
  check("lastName", "Last name should be at least 3 characters").isLength({min: 3}),
  check("lastName", "Last name should be less than 3 characters").isLength({max: 32}),
  check("email", "Email should be valid").isEmail(),
  check("password", "Password should be at least 6 characters").isLength({min: 6}),
] ,signup)

// Login GET method - Renders the login page
router.get('/', (req, res) => {
  return res.render('signin');
});

// Login POST method - Handles logging in
router.post('/', signin)

// Forgot Password Page GET method - Renders the forgot password page
router.get('/forgot-password', (req, res) => {
  return res.render('forgot-password');
});

// Property GET method - Gets property info to show if there are any properties that have the current user's id associated with them
// (Also renders the dashboard page)
router.get('/dashboard', requireAuth, async (req, res) => {
    try{
        const properties = await Property.find({})
        res.render('dashboard', {
          properties: properties,
          firstName: res.app.locals.user.firstName,
          lastName: res.app.locals.user.lastName,
          id: res.app.locals.user.id
        })
    } catch(error) {
      console.log(error)
        res.redirect('/')
    }
});

// Profile GET method - Gets the current user's information to display
router.get('/profile', requireAuth, async (req, res) => {
  try{
    const users = await User.find({})
    res.render('profile', {
      users: users,
      currentUser: res.app.locals.user
    })
  } catch(error) {
  console.log(error)
    res.redirect('/')
  }
});

// Add Property GET method
router.post('/dashboard/add', requireAuth, [
  check("dateOfPurchase", "Date cannot be empty").isDate(),
  check("price", "Price cannot be more than 10 digits").isLength({max: 10}),
  check("price", "Price cannot be empty").isLength({min: 1}),
  check("price", "Price can only be a number").isInt(),
  check("address", "Address cannot be more than 50 characters").isLength({max: 50}),
  check("address", "Address cannot be empty").isLength({min: 1}),
  check("zipCode", "Zip Code can only be a number").isInt(),
  check("zipCode", "Zip Code cannot be more than 10 digits").isLength({max: 8}),
  check("zipCode", "Zip Code cannot be empty").isLength({min: 1})
], addProperty);

// Edit Property GET method
router.put('/dashboard/:propertyId', requireAuth, [
  check("dateOfPurchase", "Date cannot be empty").isDate(),
  check("price", "Price cannot be more than 10 digits").isLength({max: 10}),
  check("price", "Price cannot be empty").isLength({min: 1}),
  check("price", "Price can only be a number").isInt(),
  check("address", "Address cannot be more than 50 characters").isLength({max: 50}),
  check("address", "Address cannot be empty").isLength({min: 1}),
  check("zipCode", "Zip Code can only be a number").isInt(),
  check("zipCode", "Zip Code cannot be more than 10 digits").isLength({max: 8}),
  check("zipCode", "Zip Code cannot be empty").isLength({min: 1})
], editProperty);

// Delete Property GET method
router.delete('/dashboard/:propertyId', requireAuth, deleteProperty);

// Edit Profile POST method
router.post('/profile', requireAuth, [
  check("firstName", "First name should be at least 3 characters").isLength({min: 3}),
  check("firstName", "First name should be less than 32 characters").isLength({max: 32}),
  check("lastName", "Last name should be at least 3 characters").isLength({min: 3}),
  check("organization", "Organization should be less than 32 characters").isLength({max: 25}),
  check("location", "Location should be less than 32 characters").isLength({max: 25}),
  check("email", "Email should be valid").isEmail(),
  check("birthday", "Birthday cannot be empty").isDate()
], editUser);

// Upload Profile Picture POST method
router.post('/profile/upload', requireAuth, upload, editUserProfileImg);

// Logout GET method - Handles logging out
router.get("/signout", requireAuth, signout)

module.exports = router