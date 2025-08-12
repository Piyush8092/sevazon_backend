const router=require('express').Router();
const { LoginRout } = require('../controllers/login');
const { SignupRout } = require('../controllers/signup');
const  authGuard  = require('../middleware/auth');
const connectDB=require('../DB/connection');
const cookie=require('cookie-parser');
const { CreateAdd,GetAllAdds,GetSpecificAdd,UpdateSpecificAdd,DeleteSpecificAdd,queryAdds } = require('../controllers/Adds');
  const { createOffer } = require('../controllers/offersAndDiscount');
const { CreateAllServices} = require('../controllers/AllServicesRegistration/createAllService');
const { UpdateSpecificServices } = require('../controllers/AllServicesRegistration/UpdateSpecificServices');
const { GetSpecificServices } = require('../controllers/AllServicesRegistration/GetSpecificServices');
const { DeleteSpecsificServices } = require('../controllers/AllServicesRegistration/DeleteSpecificServices');
const { GetAllServices } = require('../controllers/AllServicesRegistration/GetAllServices');
const { createVarityServiceList } = require('../controllers/CreateAllServices/CreateServiceList');
 const { GetAllServiceList } = require('../controllers/CreateAllServices/GetAllServiceList');
  const { GetSpecificServiceList } = require('../controllers/CreateAllServices/GetSpecificSercice'); 
const { updateServiceListDetail } = require('../controllers/CreateAllServices/updateServiceListDetail');
const deleteServiceListDetail = require('../controllers/CreateAllServices/DeleteSpecificServiceDetail');
const { queryServices } = require('../controllers/AllServicesRegistration/queryServices');
const { queryServiceList } = require('../controllers/CreateAllServices/queryServiceList');
 const { getAllJob } = require('../controllers/JobPost/getAllJob');
const { getSpecificJob } = require('../controllers/JobPost/getSpecificJob');
const { updateJob } = require('../controllers/JobPost/updateJob');
const { deleteJob } = require('../controllers/JobPost/deletejob');
const { queryJobs } = require('../controllers/JobPost/queryJobs');
const { createJob } = require('../controllers/JobPost/createJob');
const { createMatrimony } = require('../controllers/MatrimonyPost/createMatrimony');
const { getAllMatrimony } = require('../controllers/MatrimonyPost/getAllMatrimony');
const { getSpecificMatrimony } = require('../controllers/MatrimonyPost/getSpecificMatrimony');
const { updateMatrimony } = require('../controllers/MatrimonyPost/updateMatrimony');
const { deleteMatrimony } = require('../controllers/MatrimonyPost/deleteMatrimony');
const { queryMatrimony } = require('../controllers/MatrimonyPost/queryMatrimony');
const { createProperty } = require('../controllers/Property/createMatrimony');
const { getAllProperty } = require('../controllers/Property/getAllMatrimony');
const { getSpecificqueryProperty } = require('../controllers/Property/getSpecificMatrimony');
const { updateProperty } = require('../controllers/Property/updateMatrimony');
const { deleteProperty } = require('../controllers/Property/deleteMatrimony');
const { queryProperty } = require('../controllers/Property/queryMatrimony');

cookie();
router.get('/', (req, res) => {
    res.send('Hello savazon!');
});

router.post('/signup',SignupRout);
router.post('/login',LoginRout);

// for craete all services
router.post('/create-all-service',authGuard,CreateAllServices);
router.put('/update-specific-service/:id',authGuard,UpdateSpecificServices);
router.get('/get-specific-service/:id',GetSpecificServices);
router.delete('/delete-specific-service/:id',authGuard,DeleteSpecsificServices);
router.get('/get-all-service',authGuard,GetAllServices);
router.get('/get-query-service',queryServices);


// for display all services
router.post('/create-service-list',authGuard,createVarityServiceList);
router.get('/get-service-list',GetAllServiceList)
router.put('/update-specific-service-list/:id',authGuard,updateServiceListDetail)
router.delete('/delete-specific-service-list/:id',authGuard,deleteServiceListDetail)
router.get('/get-specific-service-list/:id',GetSpecificServiceList)
router.get('/get-query-service-list',queryServiceList);

// for job post
router.post('/create-job',authGuard,createJob);
router.get('/get-all-job',getAllJob);
router.get('/get-specific-job/:id',getSpecificJob);
router.put('/update-specific-job/:id',authGuard,updateJob);
router.delete('/delete-specific-job/:id',authGuard,deleteJob);
router.get('/get-query-job',queryJobs);

// for matrimony post
router.post('/create-matrimony',authGuard,createMatrimony);
router.get('/get-all-matrimony',getAllMatrimony);
router.get('/get-specific-matrimony/:id',getSpecificMatrimony);
router.put('/update-specific-matrimony/:id',authGuard,updateMatrimony);
router.delete('/delete-specific-matrimony/:id',authGuard,deleteMatrimony);
router.get('/get-query-matrimony',queryMatrimony);

// for propert post
router.post('create-property',authGuard,createProperty);
router.get('/get-all-property',getAllProperty);
router.get('/get-specific-property/:id',getSpecificqueryProperty);
router.put('/update-specific-property/:id',authGuard,updateProperty);
router.delete('/delete-specific-property/:id',authGuard,deleteProperty);
router.get('/get-query-property',queryProperty);


// for Offers post
router.post('/create-offer',authGuard, createOffer);

// for adds post
router.post('/create-ad',authGuard,CreateAdd);
router.get('/get-all-adds',GetAllAdds);
router.get('/get-specific-add/:id',GetSpecificAdd);
router.put('/update-specific-add/:id',authGuard,UpdateSpecificAdd);
router.delete('/delete-specific-add/:id',authGuard,DeleteSpecificAdd);
router.get('/get-query-add',queryAdds);



module.exports=router;