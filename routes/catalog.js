var express = require('express');
var router = express.Router();


//require controller modules
var auth_controller=require('../controllers/authcontroller');
var users_controller=require('../controllers/userscontroller');
var bookings_controller= require('../controllers/bookingscontroller');
var resources_controller= require('../controllers/resourcescontroller');

//menu
router.get('/',function(req,res,next){
    res.render('CentralPage',{role:"admin",username:"User"});
});


//Resources endpoints

// GET ALL resources list    OK
router.get('/resources',auth_controller.auth,resources_controller.resourceslistcontroller);
//GET resource by id OK
router.get('/resources/:id/get',auth_controller.adminauth,resources_controller.resourcebyidcontroller);
//GET resource create form requires OK admin authentication ekremmei
router.get('/resources/create',auth_controller.adminauth,resources_controller.resourcecreateformcontroller);
//POST resource from resource create form  OK requires admin authentication ekremei
router.post('/resources/create',resources_controller.resourcecreatepostcontroller);
//GET resource update form requires admin authentication EKREMEI
router.get('/resources/:id/update',auth_controller.adminauth,resources_controller.updateresourcegetcontroller);
//POST  updated resource ekremei
router.post('/resources/:id/update',resources_controller.updateresourcepostcontroller);
//DELETE  a resource requires admin auth OK
router.post('/resources/:id/delete',auth_controller.adminauth,resources_controller.deleteresourcepostcontroller);
//GET RESOURCE SPECIFIC BOOK FORM  OK
router.get('/resources/:id/addBooking',auth_controller.auth,resources_controller.resourcegetbookcontroller);
//POST booking to specific resource OK
router.post('/resources/:id/addBooking',resources_controller.postbookingcontroller)

  //Books endpoints


//GET all bookings requires OK admin authentication EKREMEI mallon tha gini My Bookings fasi role based
router.get('/bookings',auth_controller.auth,bookings_controller.getallbookscontroller);
//GET booking by ID EKREMEI
router.get('/bookings/:id/get',auth_controller.auth,bookings_controller.getbookbyidcontroller);
//GET all bookings by resource OK
router.get('/bookings/resource/:resourceID',auth_controller.adminauth,bookings_controller.bookbyresourcecontroller);
// GET update booking form EKREMMEI KAI USER AUTH
router.get('/bookings/:id/update',auth_controller.adminauth,bookings_controller.bookgetupdateformcontroller);
//POST update booking form EKREMEI
router.post('/bookings/:id/update',bookings_controller.bookupdatepostcontroller);
//POST delete booking form //allos controller EKREMEI
router.post('/bookings/:id/delete',bookings_controller.bookdeletepostcontroller);


// users endpoint OK
router.get('/users',users_controller.getalluserscontroller);
router.get('/billing/:id',auth_controller.auth,users_controller.getuserBilling);
module.exports = router;