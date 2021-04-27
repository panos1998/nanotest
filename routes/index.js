var express = require('express');
var router = express.Router();

//require controller modules
var auth_controller=require('../controllers/authcontroller');
var users_controller=require('../controllers/userscontroller');
var bookings_controller= require('../controllers/bookingscontroller');
var resources_controller= require('../controllers/resourcescontroller');

/* GET home page. */
router.get('/blabla', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*GET HOMEPAGE*/
router.get('/',auth_controller.gethomepagecontroller);
/*GET MENU */
router.get('/menu',auth_controller.getmenucontroller);
/*GET REGISTER FORM*/
router.get('/register/',auth_controller.getregisterformcontroller);
/* POST REGISTER data*/
router.post('/register/',auth_controller.postregistercontroller);
/*GET LOGIN FORM*/
router.get('/login/',auth_controller.getloginformcontroller);
/* POST LOGIN DATA requires admin authentication*/
router.post('/login/',auth_controller.auth,auth_controller.postlogindatacontroller);
/*LOG OUT*/
router.get('/logout',auth_controller.getlogoutcontroller);
module.exports = router;
