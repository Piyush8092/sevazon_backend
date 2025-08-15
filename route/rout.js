const router=require('express').Router();
const { LoginRout } = require('../controllers/login');
const { SignupRout } = require('../controllers/signup');
const  authGuard  = require('../middleware/auth');
const connectDB=require('../DB/connection');
const cookie=require('cookie-parser');
const { CreateAdd,GetAllAdds,GetSpecificAdd,UpdateSpecificAdd,DeleteSpecificAdd,queryAdds } = require('../controllers/Adds');
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
const { createOffer } = require('../controllers/offersAndDiscount');
const { GetAllOffer } = require('../controllers/offersAndDiscount');
const { GetSpecificOffer } = require('../controllers/offersAndDiscount');
const { UpdateSpecificOffer } = require('../controllers/offersAndDiscount');
const { DeleteSpecificOffer } = require('../controllers/offersAndDiscount');
const { queryOffer } = require('../controllers/offersAndDiscount');
const { createEditor } = require('../controllers/newsEditor/createEditor');
const { getAllEditor } = require('../controllers/newsEditor/getAllEditor');
const { getSpecificEditor } = require('../controllers/newsEditor/getSpecificEditor');
const { updateEditor } = require('../controllers/newsEditor/updateEditor');
const { deleteEditor } = require('../controllers/newsEditor/deleteEditor');
const { queryEditors } = require('../controllers/newsEditor/queryEditor');
const { createNews } = require('../controllers/NewsPost/createNews');
const { getAllNews } = require('../controllers/NewsPost/getAllNews');
const { getSpecificNews } = require('../controllers/NewsPost/getSpecificNews');
const { updateNews } = require('../controllers/NewsPost/updateNews');
const { deleteNews } = require('../controllers/NewsPost/deleteNews');
const {  queryNews } = require('../controllers/NewsPost/queryNews');
const { updateFollower } = require('../controllers/newsEditor/updateFollower');
const { createContact } = require('../controllers/contact/createContact');
const { getContact } = require('../controllers/contact/getContactData');
const { deleteContact } = require('../controllers/contact/DeleteContact');
const { queryContact } = require('../controllers/contact/queryContact');
const { JobApply, ApplyedJob } = require('../controllers/ApplyJob/applyJobs');
const { getAllApplyJob } = require('../controllers/ApplyJob/getAllApplyUserJob');
const { getSpecificApplyJob } = require('../controllers/ApplyJob/getSpecificApplyJob');
const { getApplyedJob } = require('../controllers/ApplyJob/JobApplierView');
const { jobCreaterView, getApplyedJobCreterView } = require('../controllers/ApplyJob/jobCreaterView');
const { getJobCreaterView } = require('../controllers/JobPost/jobCreaterView');
const { MatrimonyCreatorView } = require('../controllers/MatrimonyPost/matrimoneyCreatorView');
const { NewsEditorView } = require('../controllers/NewsPost/NewsEditorView');
const { PropertyEditorView } = require('../controllers/Property/propertyEditorView');
const { updateApplyJob } = require('../controllers/ApplyJob/EditApplyJob');
const { LogoutRout } = require('../controllers/logout');

cookie();
router.get('/', (req, res) => {
    res.send('Hello savazon!');
});


// auth of signup and login
router.post('/signup',SignupRout);
router.post('/login',LoginRout);
router.get('/logout',LogoutRout);


// for display all services list items
router.post('/create-service-list',authGuard,createVarityServiceList);
router.get('/get-service-list',GetAllServiceList)
router.put('/update-specific-service-list/:id',authGuard,updateServiceListDetail)
router.delete('/delete-specific-service-list/:id',authGuard,deleteServiceListDetail)
router.get('/get-specific-service-list/:id',GetSpecificServiceList)
// api name of query service
// http://localhost:3000/api/get-query-service-list?query=Plumbing
router.get('/get-query-service-list',queryServiceList);




// for craete all services
router.post('/create-all-service',authGuard,CreateAllServices);
router.put('/update-specific-service/:id',authGuard,UpdateSpecificServices);
router.get('/get-specific-service/:id',GetSpecificServices);
router.delete('/delete-specific-service/:id',authGuard,DeleteSpecsificServices);
router.get('/get-all-service',authGuard,GetAllServices);
 router.get('/get-query-service',queryServices);



 
// for job post
router.post('/create-job',authGuard,createJob);
router.get('/get-all-job',getAllJob);
router.get('/get-specific-job/:id',getSpecificJob);
router.put('/update-specific-job/:id',authGuard,updateJob);
router.delete('/delete-specific-job/:id',authGuard,deleteJob);
router.get('/get-query-job',queryJobs);
router.get('/get-job-creator-view',authGuard,getJobCreaterView);

// for matrimony post
router.post('/create-matrimony',authGuard,createMatrimony);
router.get('/get-all-matrimony',getAllMatrimony);
router.get('/get-specific-matrimony/:id',getSpecificMatrimony);
router.put('/update-specific-matrimony/:id',authGuard,updateMatrimony);
router.delete('/delete-specific-matrimony/:id',authGuard,deleteMatrimony);
router.get('/get-query-matrimony',queryMatrimony);
router.get('/get-matrimony-creator-view',authGuard,MatrimonyCreatorView);

// for propert post
router.post('create-property',authGuard,createProperty);
router.get('/get-all-property',getAllProperty);
router.get('/get-specific-property/:id',getSpecificqueryProperty);
router.put('/update-specific-property/:id',authGuard,updateProperty);
router.delete('/delete-specific-property/:id',authGuard,deleteProperty);
router.get('/get-query-property',queryProperty);
router.get('/get-property-editor-view',authGuard,PropertyEditorView);


// for Offers post
router.post('/create-offer',authGuard,createOffer);
router.get('/get-all-offer',GetAllOffer);
router.get('/get-specific-offer/:id',GetSpecificOffer);
router.put('/update-specific-offer/:id',authGuard,UpdateSpecificOffer);
router.delete('/delete-specific-offer/:id',authGuard,DeleteSpecificOffer);
router.get('/get-query-offer',queryOffer);

// for adds post
router.post('/create-ad',authGuard,CreateAdd);
router.get('/get-all-adds',GetAllAdds);
router.get('/get-specific-add/:id',GetSpecificAdd);
router.put('/update-specific-add/:id',authGuard,UpdateSpecificAdd);
router.delete('/delete-specific-add/:id',authGuard,DeleteSpecificAdd);
router.get('/get-query-add',queryAdds);


// editor post
router.post('/create-editor',authGuard,createEditor);
router.get('/get-all-editor',getAllEditor);
router.get('/get-specific-editor/:id',getSpecificEditor);
  router.put('/update-specific-editor/:id',authGuard,updateEditor);
  router.delete('/delete-specific-editor/:id',authGuard,deleteEditor);
  router.get('/get-query-editor',queryEditors);
  // for followers and following 
  router.put('/update-follower-detail/:id',authGuard,updateFollower);



// new post
router.post('/create-news',authGuard,createNews);
router.get('/get-all-news',getAllNews);
router.get('/get-specific-news/:id',getSpecificNews);
router.put('/update-specific-news/:id',authGuard,updateNews);
router.delete('/delete-specific-news/:id',authGuard,deleteNews);
router.get('/get-query-news',queryNews);
router.get('/get-news-editor-view',authGuard,NewsEditorView);


// job Apply
router.post('/apply-job/:job_id',authGuard,ApplyedJob)
router.get('/get-all-apply-job',authGuard,getAllApplyJob);
router.get('/get-specific-apply-job/:apply_id',getSpecificApplyJob);
router.get('/applier-view',authGuard,getApplyedJob);
router.get('/job-creator-view',authGuard,getApplyedJobCreterView);
router.put('/update-job-application/:apply_id',authGuard,updateApplyJob);


// coontact us
router.post('create-contact',createContact);
router.get('/get-all-contact',getContact);
router.delete('/delete-specific-contact/:id',deleteContact);
router.get('/get-qurey-contact',queryContact);



module.exports=router;
