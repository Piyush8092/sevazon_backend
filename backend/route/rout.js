const router=require('express').Router();
const { LoginRout } = require('../controllers/login');
const { SignupRout } = require('../controllers/signup');
const  authGuard  = require('../middleware/auth');
const connectDB=require('../DB/connection');
const cookie=require('cookie-parser');
const { CreateAdd,GetAllAdds,GetSpecificAdd,UpdateSpecificAdd,DeleteSpecificAdd,queryAdds, AddCreaterView } = require('../controllers/Adds');
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

const { createProperty } = require('../controllers/Property/createProperty');
const { getAllProperty } = require('../controllers/Property/getAllProperty');
const { getSpecificqueryProperty } = require('../controllers/Property/getSpecificProperty');
const { updateProperty } = require('../controllers/Property/updateProperty');
const { deleteProperty } = require('../controllers/Property/deleteProperty');
const { queryProperty } = require('../controllers/Property/queryProperty');



const { createOffer, showCreateOfferView } = require('../controllers/offersAndDiscount');
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
const { newsLike } = require('../controllers/NewsPost/newsLike');
const { newsComment } = require('../controllers/NewsPost/newsComment');
const { getUserDetail } = require('../controllers/user/getUserDetail');
const { updateUser } = require('../controllers/user/updateUser');
const { deleteUser } = require('../controllers/user/deleteUser');
const { createVehicle } = require('../controllers/vehicles/createVehicals');
const { getAllVehicle } = require('../controllers/vehicles/getAllVehicle');
const { getSpecificVehicles } = require('../controllers/vehicles/getSpecificVehicles');
const { updateVehicle } = require('../controllers/vehicles/updateVehicals');
const { queryVehicles } = require('../controllers/vehicles/queryVehicles');
const { getVehiclesCreaterView } = require('../controllers/vehicles/VehiclesCreaterView');
const { deleteVehicles } = require('../controllers/vehicles/deleteVehicles');
const { createServicesRoute } = require('../controllers/localServices/createServices');
const { getAllLocalServices } = require('../controllers/localServices/getAllLocalServives');
const { getSpecificLocalServiceRoute } = require('../controllers/localServices/getSpecificLocalService');
const { deleteLocalService } = require('../controllers/localServices/deleteLocalService');
const { LocalServiceCreaterView } = require('../controllers/localServices/LocalServiceCreaterView');
const { queryLocalServices } = require('../controllers/localServices/queryLocalService');
const { updateLocalService } = require('../controllers/localServices/updateLocalService');
const { getAuthUserDetail } = require('../controllers/user/getAuthUserDetail');
const { GetSubServiceList } = require('../controllers/CreateAllServices/GetSubServiceList');
const { sendOTP } = require('../controllers/otp/sendOTP');
const { verifyOTP } = require('../controllers/otp/verifyOTP');
const { getOtp } = require('../controllers/otp/getOtp');
const { updateLike } = require('../controllers/AllServicesRegistration/updatelike');
const { updateDislike } = require('../controllers/AllServicesRegistration/updateDislike');
const { UpdateReview } = require('../controllers/AllServicesRegistration/UpdateReview');
const { createAccountDeletePolicy } = require('../controllers/AccountDeletePolicy/AccountDeletePolicyCreate');
const { getAccountDeletePolicy } = require('../controllers/AccountDeletePolicy/AccountDeletePolicyGet');
const { editAccountDeletePolicy } = require('../controllers/AccountDeletePolicy/AccountDeletePolicyEdit');
const { deleteAccountDeletePolicy } = require('../controllers/AccountDeletePolicy/AccountDeletePolicyDelete');
const { createPrivacyPolicy } = require('../controllers/privacy/privacyCreate');
const { getPrivacyPolicy } = require('../controllers/privacy/privacyGet');
const { editPrivacyPolicy } = require('../controllers/privacy/privecyEdit');
const { deletePrivacyPolicy } = require('../controllers/privacy/privecyDelete');
const { createTermsAndConditions } = require('../controllers/term/termCreate');
const { getTermsAndConditions } = require('../controllers/term/termGet');
const { editTermsAndConditions } = require('../controllers/term/termEdit');
const { deleteTermsAndConditions } = require('../controllers/term/termDelete');
const { getSpecificAccountDeletePolicy } = require('../controllers/AccountDeletePolicy/getSpecificAccountDeletion');
const { getSpecificPrivacyPolicy } = require('../controllers/privacy/getSpecificPrivecy');
const { getSpecificTermsAndConditions } = require('../controllers/term/getSpecificTerm');
const { deleteApplyJob } = require('../controllers/ApplyJob/deleteJobs');
const { updateContact } = require('../controllers/contact/updateContact');
const { getSpecificContact } = require('../controllers/contact/getSpecificContact');
const { newsDislike } = require('../controllers/NewsPost/newsDisLike');
const { AdminUpdate } = require('../controllers/user/AdminUpdate');
const { getSpecificUser } = require('../controllers/user/getSpecificUser');
const { adminAllUserView } = require('../controllers/user/adminAllUserView');
const { AdminSpecificUserView } = require('../controllers/user/AdminSpecificUserView');
cookie();
router.get('/', (req, res) => {
    res.send('Hello savazon!');
});


// auth of signup and login
router.post('/signup',SignupRout);
router.post('/login',LoginRout);
router.get('/logout',LogoutRout);
router.get('/auth-user',authGuard,getAuthUserDetail);

// for otp verification
router.post('/send-otp',sendOTP);
router.post('/verify-otp',verifyOTP);
router.get('/resend-otp/:phone',getOtp);


// for display all services list items
router.post('/create-service-list',authGuard,createVarityServiceList);
router.get('/get-service-list',GetAllServiceList)
router.put('/update-specific-service-list/:id',authGuard,updateServiceListDetail)
router.delete('/delete-specific-service-list/:id',authGuard,deleteServiceListDetail)
router.get('/get-specific-service-list/:id',GetSpecificServiceList);
router.get('/get-sub-service-list/:id',GetSubServiceList);
// api name of query service
// http://localhost:3000/api/get-query-service-list?query=Plumbing
router.get('/get-query-service-list',queryServiceList);




// for craete all services
router.post('/create-all-service',authGuard,CreateAllServices);
router.put('/update-specific-service/:id',authGuard,UpdateSpecificServices);
router.get('/get-specific-service/:id',GetSpecificServices);
router.delete('/delete-specific-service/:id',authGuard,DeleteSpecsificServices);
router.get('/get-all-service',GetAllServices);
// api route is http://localhost:3000/api/get-query-service?query=Bengaluru
 router.get('/get-query-service',queryServices);
// for like comment 
router.put('/update-specific-service-like/:id',authGuard,updateLike);
router.put('/update-specific-service-dislike/:id',authGuard,updateDislike);
router.put('/update-specific-service-review/:id',authGuard,UpdateReview);

 

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
router.get('/get-matrimony-creator-view',authGuard,MatrimonyCreatorView);
// api is =>. http://localhost:3000/api/get-query-matrimony?query=Brahmin
router.get('/get-query-matrimony',queryMatrimony);



// for propert post
router.post('/create-property',authGuard,createProperty);
router.get('/get-all-property',getAllProperty);
router.get('/get-specific-property/:id',getSpecificqueryProperty);
router.put('/update-specific-property/:id',authGuard,updateProperty);
router.delete('/delete-specific-property/:id',authGuard,deleteProperty);
// api is => http://localhost:3000/api/get-query-property?query=Bengaluru
router.get('/get-query-property',queryProperty);
router.get('/get-property-editor-view',authGuard,PropertyEditorView);


// for Offers post
router.post('/create-offer',authGuard,createOffer);
router.get('/get-all-offer',GetAllOffer);
router.get('/get-specific-offer/:id',GetSpecificOffer);
router.put('/update-specific-offer/:id',authGuard,UpdateSpecificOffer);
router.delete('/delete-specific-offer/:id',authGuard,DeleteSpecificOffer);
// api is => http://localhost:3000/api/get-query-offer?query=411001
router.get('/get-query-offer',queryOffer);
router.get('/show-create-offer-view',authGuard,showCreateOfferView);


// for adds post
router.post('/create-ad',authGuard,CreateAdd);
router.get('/get-all-ad',GetAllAdds);
router.get('/get-specific-ad/:id',GetSpecificAdd);
router.put('/update-specific-ad/:id',authGuard,UpdateSpecificAdd);
router.delete('/delete-specific-ad/:id',authGuard,DeleteSpecificAdd);
// api is =>    http://localhost:3000/api/get-query-ad?query=Electronics
router.get('/get-query-ad',queryAdds);
router.get('/get-add-creator-view',authGuard,AddCreaterView);


// editor post
router.post('/create-editor',authGuard,createEditor);
router.get('/get-all-editor',getAllEditor);
router.get('/get-specific-editor/:id',getSpecificEditor);
  router.put('/update-specific-editor/:id',authGuard,updateEditor);
  router.delete('/delete-specific-editor/:id',authGuard,deleteEditor);
  // api is =>http://localhost:3000/api/get-query-editor?query=foodie_vlogs123
  router.get('/get-query-editor',queryEditors);
  // for followers and following 
  router.put('/update-follower-detail/:id',authGuard,updateFollower);



// news post
router.post('/create-news',authGuard,createNews);
router.get('/get-all-news',getAllNews);
router.get('/get-specific-news/:id',getSpecificNews);
router.put('/update-specific-news/:id',authGuard,updateNews);
router.delete('/delete-specific-news/:id',authGuard,deleteNews);
// api is =>. http://localhost:3000/api/get-query-news?query=AI Revolution in 2025
router.get('/get-query-news',queryNews);
router.get('/get-news-editor-view',authGuard,NewsEditorView);
router.put('/news-comment/:news_id',authGuard,newsComment);
router.put('/news-like/:news_id',authGuard,newsLike);
router.put('/news-dislike/:news_id',authGuard,newsDislike);


// job Apply
router.post('/apply-job/:job_id',authGuard,ApplyedJob)
router.get('/get-all-apply-job',authGuard,getAllApplyJob);
router.get('/get-specific-apply-job/:apply_id',getSpecificApplyJob);
router.get('/applier-view',authGuard,getApplyedJob);
router.get('/job-creator-view',authGuard,getApplyedJobCreterView);
router.put('/update-job-application/:apply_id',authGuard,updateApplyJob);
router.delete('/delete-job-application/:apply_id',authGuard,deleteApplyJob);
  


// user releted route
router.get('/get-user-detail',authGuard,getUserDetail);
router.get('/get-all-user',authGuard,getAuthUserDetail);
router.get('/get-specific-user/:id',authGuard,getSpecificUser);
router.delete('/delete-user/:id',authGuard,deleteUser);
// update service profile => normal user
router.put('/update-user/:id',authGuard,updateUser);

// admin Access For Main UserModel Role change ['admin','user']
router.put('/update-admin-role/:id',authGuard,AdminUpdate);
router.get('/admin-all-user-view',authGuard,adminAllUserView);
router.get('/admin-get-specific-user/:id',authGuard,AdminSpecificUserView);
 




// vehicles post
router.post('/create-vehicle',authGuard,createVehicle);
router.get('/get-all-vehicle',getAllVehicle);
router.get('/get-specific-vehicle/:id',getSpecificVehicles);
router.put('/update-specific-vehicle/:id',authGuard,updateVehicle);
// api is => http://localhost:3000/api/get-query-vehicle?query=2025
router.get('/get-query-vehicle',queryVehicles);
router.get('/get-vehicles-creator-view',authGuard,getVehiclesCreaterView);
router.delete('/delete-specific-vehicle/:id',authGuard,deleteVehicles);


// local services
router.post('/create-local-services',authGuard,createServicesRoute);
router.get('/get-all-local-services',getAllLocalServices);
router.get('/get-specific-local-services/:id',getSpecificLocalServiceRoute);
router.delete('/delete-specific-local-services/:id',authGuard,deleteLocalService);
router.get('/get-local-services-creator-view',authGuard,LocalServiceCreaterView);
// api is => http://localhost:3000/api/get-query-local-services?query=local Service
router.get('/get-query-local-services',queryLocalServices);
router.put('/update-local-services/:id',authGuard,updateLocalService);




// coontact us
router.post('create-contact',createContact);
router.get('/get-all-contact',getContact);
router.delete('/delete-specific-contact/:id',deleteContact);
router.get('/get-qurey-contact',queryContact);
router.get('/get-specific-contact/:id',getSpecificContact);
router.put('/update-specific-contact/:id',authGuard,updateContact);



// account delete policy
router.post('/create-account-delete-policy',authGuard,createAccountDeletePolicy);
router.get('/get-account-delete-policy',getAccountDeletePolicy);
router.put('/edit-account-delete-policy/:id',authGuard,editAccountDeletePolicy);
router.delete('/delete-account-delete-policy/:id',authGuard,deleteAccountDeletePolicy); 
router.get('/get-specific-account-delete-policy/:id',getSpecificAccountDeletePolicy);

// privacy policy
router.post('/create-privacy-policy',authGuard,createPrivacyPolicy);
router.get('/get-privacy-policy',getPrivacyPolicy);
router.put('/edit-privacy-policy/:id',authGuard,editPrivacyPolicy);
router.delete('/delete-privacy-policy/:id',authGuard,deletePrivacyPolicy);
router.get('/get-specific-privacy-policy/:id',getSpecificPrivacyPolicy);


// terms and conditions
router.post('/create-terms-and-conditions',authGuard,createTermsAndConditions);
router.get('/get-terms-and-conditions',getTermsAndConditions);
router.put('/edit-terms-and-conditions/:id',authGuard,editTermsAndConditions);
router.delete('/delete-terms-and-conditions/:id',authGuard,deleteTermsAndConditions);
router.get('/get-specific-terms-and-conditions/:id',getSpecificTermsAndConditions);

module.exports=router;
