const router=require('express').Router();
const { LoginRout } = require('../controllers/login');
const { SignupRout } = require('../controllers/signup');
const  authGuard  = require('../middleware/auth');
const connectDB=require('../DB/connection');
const cookie=require('cookie-parser');
const { CreateAdd,GetAllAdds,GetSpecificAdd,UpdateSpecificAdd,DeleteSpecificAdd,queryAdds, AddCreaterView, getAllNotVerifiedAdds, FilterAdds, specificAddAdminView, getTotalAdCount, getAllAdUser, sendNotificationToAddPoster } = require('../controllers/Adds');
 const { CreateAllServices} = require('../controllers/AllServicesRegistration/createAllService');
const { UpdateSpecificServices } = require('../controllers/AllServicesRegistration/UpdateSpecificServices');
const { GetAllServiceListName } = require('../controllers/CreateAllServices/GetAllServiceListName');
const { GetAllServiceListSubName } = require('../controllers/CreateAllServices/GetAllServiceListSubName');
const { getNonProfileUser } = require('../controllers/user/getNonProfileUser');

const { GetSpecificServices } = require('../controllers/AllServicesRegistration/GetSpecificServices');
const { FilterServices } = require('../controllers/AllServicesRegistration/FilterServices');
const { DeleteSpecsificServices } = require('../controllers/AllServicesRegistration/DeleteSpecificServices');
const { GetAllServices } = require('../controllers/AllServicesRegistration/GetAllServices');
const { createVarityServiceList } = require('../controllers/CreateAllServices/CreateServiceList');
const { AdminSpecificServiceView } = require('../controllers/AllServicesRegistration/AdminSpecificServiceView');
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
const { FilterJobs } = require('../controllers/JobPost/FilterJobs');
const { createMatrimony } = require('../controllers/MatrimonyPost/createMatrimony');
const { getAllMatrimony } = require('../controllers/MatrimonyPost/getAllMatrimony');
const { getSpecificMatrimony } = require('../controllers/MatrimonyPost/getSpecificMatrimony');
const { FilterMatrimony } = require('../controllers/MatrimonyPost/FilterMatrimony');
const { updateMatrimony } = require('../controllers/MatrimonyPost/updateMatrimony');
const { deleteMatrimony } = require('../controllers/MatrimonyPost/deleteMatrimony');
const { queryMatrimony } = require('../controllers/MatrimonyPost/queryMatrimony');

const { createProperty } = require('../controllers/Property/createProperty');
const { getAllProperty } = require('../controllers/Property/getAllProperty');
const { getSpecificqueryProperty } = require('../controllers/Property/getSpecificProperty');
const { updateProperty } = require('../controllers/Property/updateProperty');
const { deleteProperty } = require('../controllers/Property/deleteProperty');
const { queryProperty } = require('../controllers/Property/queryProperty');



const { createOffer, showCreateOfferView, FilterOffer, specificOfferAdminView, getTotalOfferCount, getAllOfferUser, sendNotificationToOfferPoster } = require('../controllers/offersAndDiscount');
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
const { verifyDocument, verifyDocumentImage } = require('../controllers/newsEditor/kycVerification');
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
const { AdminJobView } = require('../controllers/JobPost/AdminJobView');
const { getJobCreaterView } = require('../controllers/JobPost/jobCreaterView');
const { MatrimonyCreatorView } = require('../controllers/MatrimonyPost/matrimoneyCreatorView');
const { NewsEditorView } = require('../controllers/NewsPost/NewsEditorView');
const { PropertyEditorView } = require('../controllers/Property/propertyEditorView');
 const { LogoutRout } = require('../controllers/logout');
const { newsLike } = require('../controllers/NewsPost/newsLike');
const { newsComment } = require('../controllers/NewsPost/newsComment');
const { getUserDetail } = require('../controllers/user/getUserDetail');
const { updateUser } = require('../controllers/user/updateUser');
const { deleteUser } = require('../controllers/user/deleteUser');
const { verifyUserKyc } = require('../controllers/user/verifyUserKyc');
const { followEditor } = require('../controllers/user/followEditor');
const { updateFcmToken } = require('../controllers/user/updateFcmToken');
const { removeFcmToken } = require('../controllers/user/removeFcmToken');
const { getFcmStatus } = require('../controllers/user/getFcmStatus');
const { reportDevice } = require('../controllers/user/reportDevice');
const { reportUser } = require('../controllers/user/reportUser');
const { getAllReports } = require('../controllers/user/getAllReports');
const { blockUser, unblockUser } = require('../controllers/user/blockUser');
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
const { unifiedSearch } = require('../controllers/search/unifiedSearch');
const { trackActivity, getUserActivity } = require('../controllers/userActivity/trackActivity');
const { getRecommendations } = require('../controllers/userActivity/getRecommendations');
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
const {getTotalUserCount } = require('../controllers/user/getTotalUserCount');

// Contact Settings controllers
const { getContactSettings } = require('../controllers/contactSettings/getContactSettings');
const { updateContactSettings } = require('../controllers/contactSettings/updateContactSettings');

// Seasonal Category controllers
const { getSeasonalCategory } = require('../controllers/seasonalCategory/getSeasonalCategory');
const { setSeasonalCategory } = require('../controllers/seasonalCategory/setSeasonalCategory');
const { clearSeasonalCategory } = require('../controllers/seasonalCategory/clearSeasonalCategory');

// Featured Category controllers
const getFeaturedCategories = require('../controllers/featuredCategory/getFeaturedCategories');
const setFeaturedCategory = require('../controllers/featuredCategory/setFeaturedCategory');
const clearFeaturedCategory = require('../controllers/featuredCategory/clearFeaturedCategory');
const getFeaturedCategoryTypes = require('../controllers/featuredCategory/getFeaturedCategoryTypes');
const updateFeaturedCategoryType = require('../controllers/featuredCategory/updateFeaturedCategoryType');

// Feedback controllers
const { createFeedback } = require('../controllers/feedback/createFeedback');
const { getAllFeedback } = require('../controllers/feedback/getAllFeedback');
const { getSpecificFeedback } = require('../controllers/feedback/getSpecificFeedback');
const { updateFeedback } = require('../controllers/feedback/updateFeedback');
const { deleteFeedback } = require('../controllers/feedback/deleteFeedback');
const { queryFeedback } = require('../controllers/feedback/queryFeedback');
const { getAllUserForNotification } = require('../controllers/user/getAllUserForNotification');

// Import FCM routes
const fcmRoutes = require('./fcmRoutes');

// Import Agora controller and validation
const agoraController = require('../controllers/agora/agoraController');
const { body, param } = require('express-validator');
const { agoraCallLimit, agoraTokenLimit, generalAgoraLimit } = require('../middleware/rateLimiter');

cookie();
const { AdminUpdate } = require('../controllers/user/AdminUpdate');
const { getSpecificUser } = require('../controllers/user/getSpecificUser');
const { adminAllUserView } = require('../controllers/user/adminAllUserView');
const { AdminSpecificUserView } = require('../controllers/user/AdminSpecificUserView');
const { queryAdminUser } = require('../controllers/user/queryUserModel');
const { queryServiceUser } = require('../controllers/user/queryServiceUser');
const { getNotVerifiedUser } = require('../controllers/newsEditor/getNotVerifiedEditor');
const { getVerifiedUser } = require('../controllers/newsEditor/getVerifiedUser');
const { getServiceCreaterView } = require('../controllers/AllServicesRegistration/getServiceCreaterView');
const { createLead } = require('../controllers/leads/createLead');
const { getAllLead } = require('../controllers/leads/getAllLead');
const { getSpecificLead } = require('../controllers/leads/getSpecificLead');
const { updateLead } = require('../controllers/leads/updateLead');
const { deleteLead } = require('../controllers/leads/daleteLead');
const { getQueryLead } = require('../controllers/leads/getQueryLead');
const { getLeadCreaterView } = require('../controllers/leads/getLeadCreaterView');
const { getAcceptedApplications } = require('../controllers/ApplyJob/getAcceptedApplications');
const { getRejectedApplications } = require('../controllers/ApplyJob/getRejectedApplications');
const { getApplicantAcceptedApplications } = require('../controllers/ApplyJob/getApplicantAcceptedApplications');
const { getApplicantRejectedApplications } = require('../controllers/ApplyJob/getApplicantRejectedApplications');
const { updateApplyStatusByCreater } = require('../controllers/ApplyJob/EditAcceptApplyJobByCreater');
const { getpendingApplications } = require('../controllers/ApplyJob/getpendingApplications');
const { getApplicantPendingApplications } = require('../controllers/ApplyJob/getApplicantPendingApplications');
const { getRatting } = require('../controllers/AllServicesRegistration/getRatting');
const { updateImportantLink } = require('../controllers/AllServicesRegistration/updateImportantLink');
const { updateTimeSlot } = require('../controllers/AllServicesRegistration/updateTimeSlot');
const { createFaq } = require('../controllers/faq/createFaq');
const { getFaq } = require('../controllers/faq/getAllFAQData');
const { getSpecificFAQ } = require('../controllers/faq/getSpecificFaq');
const { updateFaq } = require('../controllers/faq/updateFaq');
const { deleteFAQ } = require('../controllers/faq/DeleteFAQ');
const { queryFAQ } = require('../controllers/faq/queryFaq');
const { updateFavourit } = require('../controllers/JobPost/updateFavourit');
const { getAllFavouritJob } = require('../controllers/JobPost/getAllFavouritJob');
const { getSpecificApplyMatrimony } = require('../controllers/applyMatrimony/getSpecificApplyMatrimony');
const { applyMatrimony } = require('../controllers/applyMatrimony/applyMatrimony');
const { getAllApplyApplication } = require('../controllers/applyMatrimony/getAllApplyedApplication');
const { acceptMatrimony } = require('../controllers/applyMatrimony/AcceptMatrimony');
const { rejectMatrimony } = require('../controllers/applyMatrimony/rejectMatrimony');
const { getAcceptMetrimony } = require('../controllers/applyMatrimony/getAcceptMetrimony');
const { getRejectMatrimony } = require('../controllers/applyMatrimony/getRejectMatrimony');
const {getTotalJobCount } = require('../controllers/JobPost/getTotalJobCount');
// Pricing Plan controllers
const { createPricingPlan } = require('../controllers/pricingPlan/createPricingPlan');
const { getAllPricingPlans } = require('../controllers/pricingPlan/getAllPricingPlans');
const { getPricingPlansByCategory } = require('../controllers/pricingPlan/getPricingPlansByCategory');
const { getSpecificPricingPlan } = require('../controllers/pricingPlan/getSpecificPricingPlan');
const { updatePricingPlan } = require('../controllers/pricingPlan/updatePricingPlan');
const { deletePricingPlan } = require('../controllers/pricingPlan/deletePricingPlan');
const { getTotalMatrimonyCount } = require('../controllers/MatrimonyPost/getTotalMatrimonyCount');

// Payment controllers
const { createPaymentOrder } = require('../controllers/payment/createPaymentOrder');
const { verifyPayment } = require('../controllers/payment/verifyPayment');
const { getPaymentHistory } = require('../controllers/payment/getPaymentHistory');
const { getRazorpayKey } = require('../controllers/payment/getRazorpayKey');

 cookie();
 const { getAllPrimiumUser } = require('../controllers/user/getAllPrimiumUser');

const { UpdateReportAndBlock } = require('../controllers/AllServicesRegistration/UpdateReportAndBlock');
 const { UpdateServiceProfileBookMark } = require('../controllers/AllServicesRegistration/UpdateServiceProfileBookMark');
const { getBookmarkServiceProfile } = require('../controllers/user/getBookmarkServiceProfile');
const { getBookmarkJobPost } = require('../controllers/user/getBookmarkJobPost');
const { getReportAndBlockServiceProfile } = require('../controllers/user/getReportAndBlockServiceProfile');
const { UpdateReportAndBlockMatrimony } = require('../controllers/MatrimonyPost/UpdateReportAndBlockMatrimony');
const { getReportAndBlockMatrimonyProfile } = require('../controllers/MatrimonyPost/getReportAndBlockMatrimonyProfile');
const { getBookmarkMatrimonyProfile } = require('../controllers/MatrimonyPost/getBookmarkMatrimonyProfile');
const { UpdateMatrimonyProfileBookMark } = require('../controllers/MatrimonyPost/UpdateMatrimonyProfileBookMark');
const { UpdateJobProfileBookMark } = require('../controllers/JobPost/UpdateJobProfileBookMark');
const { UpdateReportAndBlockJob } = require('../controllers/JobPost/UpdateReportAndBlockJob');
const { getReportAndBlockJobProfile } = require('../controllers/JobPost/getReportAndBlockJobProfile');
const { getBlockUserView } = require('../controllers/AllServicesRegistration/getBlockUserView');
const { getBlockJobUserView } = require('../controllers/JobPost/getBlockJobUserView');
const { getBlockMatrimonyUserView } = require('../controllers/MatrimonyPost/getBlockMatrimonyUserView');
const { getPendingMatrimony } = require('../controllers/applyMatrimony/getPendingMatrimony');
const { AdminLeadView } = require('../controllers/leads/AdminLeadsView');
const { specificLoaclServicesAdminView } = require('../controllers/localServices/specificUserAdminView');
const { specificMatrimonyAdminView } = require('../controllers/MatrimonyPost/getSpecificUserAdminView');
const { specificNewsAdminView } = require('../controllers/NewsPost/getSpecificUserAdminView');
const { specificVehiclesAdminView } = require('../controllers/vehicles/getSpecificUserAdminView');
const { specificPropertyAdminView } = require('../controllers/Property/getSpecificUserAdminView');
const { specificFeedbackAdminView } = require('../controllers/feedback/specificFeedbackAdminView');
const {getTotalPropertyCount } = require('../controllers/Property/getTotalPropertyCount');
 const { getTotalNewsCount } = require('../controllers/NewsPost/getTotalNewsCount');
const { getTotalLocalServicesCount } = require('../controllers/localServices/getTotalLocalServicesCount');
const { getTotalContactCount}= require('../controllers/contact/getTotalContactCount');

const { getAllServiceUser } = require('../controllers/AllServicesRegistration/getAlluserService');
const { ALLuserJob } = require('../controllers/JobPost/ALLuserJob');
const { getAllMatrimonyUser } = require('../controllers/MatrimonyPost/getAllMatrimonyUser');
const { getAllPropertyUser } = require('../controllers/Property/getAllPropertyUser');
const { getAllNewsUser } = require('../controllers/NewsPost/getAllNewsUser');
const { getAllLocalServicesUser } = require('../controllers/localServices/getAllLocalServicesUser');
const { sendNotificationToJobPoster } = require('../controllers/JobPost/sendNotificationToJobPoster');
const { sendNotificationToMatrimonyPoster } = require('../controllers/MatrimonyPost/sendNotificationToMatrimonyPoster');
const { sendNotificationToPropertyPoster } = require('../controllers/Property/sendNotificationToPropertyPoster');
 const { sendNotificationToNewsPoster } = require('../controllers/NewsPost/sendNotificationToNewsPoster');
 const { sendNotificationToLocalServicesPoster } = require('../controllers/localServices/sendNotificationToLocalServicesPoster');
const { sendNotificationToServicePoster } = require('../controllers/AllServicesRegistration/sendNotificationToServicePoster');
const { getspecificJobApplyAdminView } = require('../controllers/ApplyJob/getspecificJobApplyAdminView');

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

// Unified search across all content types
// api is => http://localhost:3000/api/unified-search?query=Mumbai
router.get('/unified-search', unifiedSearch);

// User activity tracking and recommendations
// api is => http://localhost:3000/api/track-activity
router.post('/track-activity', trackActivity);
// api is => http://localhost:3000/api/get-user-activity
router.get('/get-user-activity', getUserActivity);
// api is => http://localhost:3000/api/get-recommendations
router.get('/get-recommendations', getRecommendations);




 
// user releted route =>service profile releretd route
router.get('/get-user-detail',authGuard,getUserDetail);
router.get('/get-all-user',authGuard,getAuthUserDetail);
//get all user for notification
router.get('/get-all-user-for-notification',authGuard,getAllUserForNotification);
router.get('/get-specific-user/:id',authGuard,getSpecificUser);
router.delete('/delete-user/:id',authGuard,deleteUser);
// update service profile => normal user
router.put('/update-user/:id',authGuard,updateUser);
router.get('/get-service-query-user',queryServiceUser);
// KYC verification for user profile
router.post('/user/kyc/verify',authGuard,verifyUserKyc);
// Follow/Unfollow editor (any user can follow)
router.post('/user/follow-editor',authGuard,followEditor);
// FCM Token Management
router.post('/user/update-fcm-token',authGuard,updateFcmToken);
router.delete('/user/remove-fcm-token',authGuard,removeFcmToken);
router.get('/user/fcm-status/:userId',authGuard,getFcmStatus);
router.post('/user/report-device',reportDevice);

// User Report and Block Management
router.post('/report-user',authGuard,reportUser);
router.get('/admin/reports',authGuard,getAllReports);
router.put('/admin/block-user/:id',authGuard,blockUser);
router.put('/admin/unblock-user/:id',authGuard,unblockUser);

// get all primium user
router.get('/get-all-primium-user',authGuard,getAllPrimiumUser);
  
  //  for bookmark job post
router.get('/get-bookmark-job-post',authGuard, getBookmarkJobPost);

//fetch non profile user if user has no post and no activity show all user
router.get('/get-non-profile-user',authGuard,getNonProfileUser);
//get total user count 
router.get('/get-total-user-count',authGuard,getTotalUserCount);


// usermodel releted route 
// admin Access For Main UserModel Role change ['admin','user'] =>at the time of login user 
router.put('/update-admin-role/:id',authGuard,AdminUpdate);
// usermodel under route
router.get('/login-user-view',authGuard,adminAllUserView);
router.get('/admin-get-specific-user/:id',authGuard,AdminSpecificUserView);
router.get('/admin-get-query-user',queryAdminUser);
 




// for display all services list items
router.post('/create-service-list',authGuard,createVarityServiceList);
router.get('/get-service-list',GetAllServiceList)
router.put('/update-specific-service-list/:id',authGuard,updateServiceListDetail)
router.delete('/delete-specific-service-list/:id',authGuard,deleteServiceListDetail)
router.get('/get-specific-service-list/:id',GetSpecificServiceList);
router.get('/get-sub-service-list/:id',GetSubServiceList);


//get all service list catagory name  unique only and catagory wise subcatagory name
//api is => http://localhost:3000/api/get-all-service-list-name
router.get('/get-all-service-list-name',GetAllServiceListName);
 
// api name of query service
// http://localhost:3000/api/get-query-service-list?query=Plumbing
router.get('/get-query-service-list',queryServiceList);

// Seasonal Category routes (Legacy - kept for backward compatibility)
// Public endpoint - get current seasonal category
router.get('/get-seasonal-category', getSeasonalCategory);
// Admin endpoints - set/clear seasonal category
router.post('/set-seasonal-category', authGuard, setSeasonalCategory);
router.delete('/clear-seasonal-category', authGuard, clearSeasonalCategory);

// Featured Category routes (New - supports multiple types: seasonal, wedding, education)
// Public endpoint - get all featured categories
router.get('/get-featured-categories', getFeaturedCategories);
// Admin endpoints - set/clear featured category
router.post('/set-featured-category', authGuard, setFeaturedCategory);
router.post('/clear-featured-category', authGuard, clearFeaturedCategory);
// Category type management endpoints
router.get('/get-featured-category-types', getFeaturedCategoryTypes);
router.put('/update-featured-category-type', authGuard, updateFeaturedCategoryType);




// for craete all services
router.post('/create-all-service',authGuard,CreateAllServices);
router.put('/update-specific-service/:id',authGuard,UpdateSpecificServices);
router.get('/get-specific-service/:id',GetSpecificServices);
router.delete('/delete-specific-service/:id',authGuard,DeleteSpecsificServices);
router.get('/get-specific-service-admin-view/:id',authGuard,AdminSpecificServiceView);
router.get('/get-all-service',authGuard,GetAllServices);
router.get('/get-all-user-service',getAllServiceUser);
// api route is http://localhost:3000/api/get-query-service?query=Bengaluru
 router.get('/get-query-service',queryServices);
// Flexible filtering API - supports multiple optional parameters
// Examples:  http://localhost:3000/api/filter-services?city=Mumbai&profileType=Service Profile&minPrice=1000
router.get('/filter-services',FilterServices);
// for like comment 
router.put('/update-specific-service-like/:id',authGuard,updateLike);
router.put('/update-specific-service-dislike/:id',authGuard,updateDislike);
router.put('/update-specific-service-review/:id',authGuard,UpdateReview);
router.get('/get-specific-service-rating',authGuard,getRatting);
// for get  created service or business profile of both in my profile
router.get('/get-service-creator-view',authGuard,getServiceCreaterView);
router.put('/update-specific-service-important-link/:id',authGuard,updateImportantLink);
router.put('/update-specific-service-time-slot/:id',authGuard,updateTimeSlot);
//seND notification to service post user 
router.get('/send-notification-to-service-poster',authGuard,sendNotificationToServicePoster);


// for report and block
//api is => http://localhost:3000/api/update-specific-service-report-block/profileId  body pass=>  {"report":"This is a test report","block":true} 
router.put('/update-specific-service-report-block/:id',authGuard,UpdateReportAndBlock);
// for report and block service profile api is => http://localhost:3000/api/get-report-block-service-profile
router.get('/get-report-block-service-profile',authGuard,getReportAndBlockServiceProfile);

// login user view whom he/she block 
router.get('/get-block-service-user-view',authGuard,getBlockUserView);

 
// for bookmark service profile
// http://localhost:3000/api/update-specific-service-bookmark.     body pass=>  {"serviceProfileBookmarkID":"650666666666666666666666"}
router.put('/update-specific-service-bookmark',authGuard,UpdateServiceProfileBookMark);
// for bookmark service profile api is => http://localhost:3000/api/get-bookmark-service-profile
router.get('/get-bookmark-service-profile',authGuard,getBookmarkServiceProfile); 


 



// for job post
router.post('/create-job',authGuard,createJob);
router.get('/get-all-job',authGuard,getAllJob);
router.get('/get-specific-job/:id',getSpecificJob);
router.put('/update-specific-job/:id',authGuard,updateJob);
router.delete('/delete-specific-job/:id',authGuard,deleteJob);
router.get('/get-all-user-job',ALLuserJob);
router.get('/get-query-job',queryJobs);
router.get('/get-total-job-count',authGuard,getTotalJobCount);
// Flexible job filtering API - supports multiple optional parameters
// Examples: /api/filter-jobs?city=Mumbai&workMode=Remote&minSalary=50000
router.get('/filter-jobs',FilterJobs);
router.get('/get-job-creator-view',authGuard,getJobCreaterView);
router.get('/get-all-job-admin-view/:id',authGuard,AdminJobView);
//send notification userId who not crate job post 
router.get('/send-notification-to-job-poster',authGuard,sendNotificationToJobPoster);


// job Apply api is => http://localhost:3000/api/apply-job/650666666666666666666666      body pass=>  {"title":"test","fullName":"test","qualification":"test","gender":"Male","pincode":"123456","city":"test","state":"test","address":"test","contactNumber":"1234567890"}
router.post('/apply-job/:job_id',authGuard,ApplyedJob);
// admin view
router.get('/get-all-job-appliation',authGuard,getAllApplyJob);
// any one can see specific apply job
router.get('/get-specific-apply-job/:apply_id',getSpecificApplyJob);
//get all application of job creater and admin view
router.get('/get-all-apply-job-admin-view/:job_id',authGuard,getspecificJobApplyAdminView);

 
// router.get('/applier-view',authGuard,getApplyedJob);
// router.get('/job-creator-view',authGuard,getApplyedJobCreterView);
// router.delete('/delete-job-application/:apply_id',authGuard,deleteApplyJob);

 // job creater view
router.get('/get-all-accepted-applications', authGuard, getAcceptedApplications);
router.get('/get-all-rejected-applications', authGuard, getRejectedApplications);
router.get('/get-all-pending-applications',authGuard,getpendingApplications);
 
// for update pass payload value  =>  { "accept_status":"Accepted"} or  { "accept_status":"Rejected"}
router.put('/update-job-application/:apply_id',authGuard,updateApplyStatusByCreater);

// job applicant view
router.get('/my-accepted-applications', authGuard, getApplicantAcceptedApplications);
router.get('/my-rejected-applications', authGuard, getApplicantRejectedApplications);
router.get('/my-pending-applications',authGuard,getApplicantPendingApplications);

//report and block job post
//api is => http://localhost:3000/api/update-specific-job-report-block/650666666666666666666666  body pass=>  {"report":"This is a test report","block":true} 
router.put('/update-specific-job-report-block/:id',authGuard,UpdateReportAndBlockJob);
// for report and block. user side view api is => http://localhost:3000/api/get-report-block-job-profile
router.get('/get-report-block-job-profile',authGuard,getReportAndBlockJobProfile);

// login user view whom he/she block 
router.get('/get-block-job-user-view',authGuard,getBlockJobUserView);


// favourite job
//api is => http://localhost:3000/api/update-job-favourite  body   pass=>  {"jobProfileBookmarkID":"650666666666666666666666"}
router.put('/update-job-favourite',authGuard,UpdateJobProfileBookMark);
  // api is => http://localhost:3000/api/get-user-favourite-job     
router.get('/get-user-favourite-job',authGuard,getAllFavouritJob);






// for matrimony post
router.post('/create-matrimony',authGuard,createMatrimony);
router.get('/get-all-matrimony',authGuard,getAllMatrimony);
router.get('/get-specific-matrimony/:id',getSpecificMatrimony);
router.put('/update-specific-matrimony/:id',authGuard,updateMatrimony);
router.delete('/delete-specific-matrimony/:id',authGuard,deleteMatrimony);
router.get('/get-matrimony-creator-view',authGuard,MatrimonyCreatorView);
router.get('/get-specific-matrimony-admin-view/:id',authGuard,specificMatrimonyAdminView);
router.get('/get-total-matrimony-count',authGuard,getTotalMatrimonyCount);
router.get('/get-all-matrimon-user',getAllMatrimonyUser);
//send notification to matrimony post user 
router.get('/send-notification-to-matrimony-poster',authGuard,sendNotificationToMatrimonyPoster);

// api is =>. http://localhost:3000/api/get-query-matrimony?query=Brahmin
router.get('/get-query-matrimony', queryMatrimony);
// Flexible matrimony filtering API - supports multiple optional parameters
// Examples: /api/filter-matrimony?gender=Male&city=Mumbai&minAge=25&maxAge=35
router.get('/filter-matrimony',FilterMatrimony);

//for report and block 
//api is => http://localhost:3000/api/update-specific-matrimony-report-block/650666666666666666666666  body pass=>  {"report":"This is a test report","block":true} 
router.put('/update-specific-matrimony-report-block/:id',authGuard,UpdateReportAndBlockMatrimony);
//for report and block. user side view api is => http://localhost:3000/api/get-report-block-matrimony-profile
router.get('/get-report-block-matrimony-profile',authGuard,getReportAndBlockMatrimonyProfile);
// login user view whom he/she block 
router.get('/get-block-matrimony-user-view',authGuard,getBlockMatrimonyUserView);


// for bookmark matrimony profile
//api is => http://localhost:3000/api/update-specific-matrimony-bookmark  body pass=>  {"matrimonyProfileBookmarkID":"650666666666666666666666"}
router.put('/update-specific-matrimony-bookmark',authGuard,UpdateMatrimonyProfileBookMark);
//api is => http://localhost:3000/api/get-bookmark-Matrimony-profile
router.get('/get-bookmark-Matrimony-profile',authGuard,getBookmarkMatrimonyProfile);




// for apply matrimony
//api is => http://localhost:3000/api/apply-matrimony/matrimony_id    
router.post('/apply-matrimony/:id',authGuard,applyMatrimony);
router.get('/get-all-apply-matrimony',authGuard,getAllApplyApplication);
router.get('/get-specific-apply-matrimony/:id',getSpecificApplyMatrimony);
//pass body {"accept":true}
router.put('/accept-matrimony/:id/:index',authGuard,acceptMatrimony);
// pass body  {"reject":true}
router.put('/reject-matrimony/:id/:index',authGuard,rejectMatrimony);
router.get('/get-all-accepted-matrimony',authGuard,getAcceptMetrimony);
router.get('/get-all-rejected-matrimony',authGuard,getRejectMatrimony);
router.get('/get-all-pending-matrimony',authGuard,getPendingMatrimony);
 


// for propert post. 
router.post('/create-property',authGuard,createProperty);
router.get('/get-all-property',authGuard,getAllProperty); 
router.get('/get-specific-property/:id',getSpecificqueryProperty);
router.put('/update-specific-property/:id',authGuard,updateProperty);
router.delete('/delete-specific-property/:id',authGuard,deleteProperty);
router.get('/get-total-property-count',authGuard,getTotalPropertyCount);
router.get('/get-all-property-user', getAllPropertyUser);
router.get('/send-notification-to-property-poster',authGuard,sendNotificationToPropertyPoster);

// api is => http://localhost:3000/api/get-query-property?query=Bengaluru
router.get('/get-query-property',queryProperty);
router.get('/get-property-editor-view',authGuard,PropertyEditorView);
router.get('/get-specific-property-admin-view/:id',authGuard,specificPropertyAdminView);


// for Offers post
router.post('/create-offer',authGuard,createOffer);
router.get('/get-all-offer',authGuard,GetAllOffer);
router.get('/get-specific-offer/:id',GetSpecificOffer);
router.put('/update-specific-offer/:id',authGuard,UpdateSpecificOffer);
router.delete('/delete-specific-offer/:id',authGuard,DeleteSpecificOffer);
router.get('/get-total-offer-count',authGuard,getTotalOfferCount);
router.get('/get-all-offer-user', getAllOfferUser);
router.get('/send-notification-to-offer-poster',authGuard,sendNotificationToOfferPoster);

// api is => http://localhost:3000/api/get-query-offer?query=411001
router.get('/get-query-offer',queryOffer);
router.get('/show-create-offer-view',authGuard,showCreateOfferView);
//api is => http://localhost:3000/api/filter-offer?city=Mumbai
router.get('/filter-offer',FilterOffer);
router.get('/get-specific-offer-admin-view/:id',authGuard,specificOfferAdminView);


// for adds post
router.post('/create-ad',authGuard,CreateAdd);
router.get('/get-all-ad',authGuard,GetAllAdds);
router.get('/get-specific-ad/:id',GetSpecificAdd);
router.put('/update-specific-ad/:id',authGuard,UpdateSpecificAdd);
router.delete('/delete-specific-ad/:id',authGuard,DeleteSpecificAdd);
router.get('/get-total-ad-count',authGuard,getTotalAdCount);
router.get('/get-all-ad-user', getAllAdUser);
// api is =>    http://localhost:3000/api/get-query-ad?query=Electronics
router.get('/get-query-ad',queryAdds);
router.get('/get-add-creator-view',authGuard,AddCreaterView);
router.get('/get-all-not-verified-adds',authGuard,getAllNotVerifiedAdds);
// api is => http://localhost:3000/api/filter-adds?category=Electronics&route=Mobiles&position=Top&isActive=true&validTill=2025-12-31&location=Bengaluru&isVerified=true&search=iPhone
router.get('/filter-adds',FilterAdds);
router.get('/get-specific-ad-admin-view/:id',authGuard,specificAddAdminView);
router.get('/send-notification-to-ad-poster',authGuard,sendNotificationToAddPoster);



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
router.get('/verified-editor',authGuard,getVerifiedUser);
router.get('/not-verified-editor',authGuard,getNotVerifiedUser);

// KYC Verification routes for news editor profiles
router.post('/kyc/verify', verifyDocument);
router.post('/kyc/verify-image', authGuard, verifyDocumentImage);




// news post
router.post('/create-news',authGuard,createNews);
router.get('/get-all-news',authGuard,getAllNews);
router.get('/get-specific-news/:id',getSpecificNews);
router.put('/update-specific-news/:id',authGuard,updateNews);
router.delete('/delete-specific-news/:id',authGuard,deleteNews);
// api is =>. http://localhost:3000/api/get-query-news?query=AI Revolution in 2025
router.get('/get-query-news',queryNews);
router.get('/get-total-news-count',authGuard,getTotalNewsCount);
router.get('/get-news-editor-view',authGuard,NewsEditorView);
router.get('/get-all-news-user', getAllNewsUser);
router.put('/news-comment/:news_id',authGuard,newsComment);
router.get('/get-specific-news-admin-view/:id',authGuard,specificNewsAdminView);
router.put('/news-like/:news_id',authGuard,newsLike);
router.put('/news-dislike/:news_id',authGuard,newsDislike);
//send notification to news post user 
router.get('/send-notification-to-news-poster',authGuard,sendNotificationToNewsPoster);

 
//report  send => any user 
// router.put('/update-specific-news-report-block/:id',authGuard,UpdateReportAndBlockNews);

// //block by user => can block any news
// router.put('/block-news/:id',authGuard,blockNews);
// //get all block news by user
// router.get('/get-block-news-user-view',authGuard,getBlockNewsUserView);
// //get all block news by admin
// router.get('/get-block-news-admin-view',authGuard,getBlockNewsAdminView);
// //bookmark => the news
// router.put('/bookmark-news/:id',authGuard,bookmarkNews);
// //get all bookmark news by user
// router.get('/get-bookmark-news-user-view',authGuard,getBookmarkNewsUserView);


 



// vehicles post
router.post('/create-vehicle',authGuard,createVehicle);
router.get('/get-all-vehicle',authGuard,getAllVehicle);
router.get('/get-specific-vehicle/:id',getSpecificVehicles);
router.put('/update-specific-vehicle/:id',authGuard,updateVehicle);
// api is => http://localhost:3000/api/get-query-vehicle?query=2025
router.get('/get-query-vehicle',queryVehicles);
router.get('/get-vehicles-creator-view',authGuard,getVehiclesCreaterView);
router.delete('/delete-specific-vehicle/:id',authGuard,deleteVehicles);
router.get('/get-specific-vehicle-admin-view/:id',authGuard,specificVehiclesAdminView);


// local services
router.post('/create-local-services',authGuard,createServicesRoute);
router.get('/get-all-local-services',authGuard,getAllLocalServices);
router.get('/get-specific-local-services/:id',getSpecificLocalServiceRoute);
router.delete('/delete-specific-local-services/:id',authGuard,deleteLocalService);
router.get('/get-local-services-creator-view',authGuard,LocalServiceCreaterView);
// api is => http://localhost:3000/api/get-query-local-services?query=local Service
router.get('/get-query-local-services',queryLocalServices);
router.get('/get-total-local-services-count',authGuard,getTotalLocalServicesCount);
router.get('/get-all-local-services-user', getAllLocalServicesUser);
router.put('/update-local-services/:id',authGuard,updateLocalService);
router.get('/get-specific-local-services-admin-view/:id',authGuard,specificLoaclServicesAdminView);
//seND notification to local services post user 
router.get('/send-notification-to-local-services-poster',authGuard,sendNotificationToLocalServicesPoster);


//leads
router.post('/create-lead',authGuard,createLead);
router.get('/get-all-lead',getAllLead);
router.get('/get-specific-lead/:id',getSpecificLead);
router.put('/update-specific-lead/:id',authGuard,updateLead);
router.delete('/delete-specific-lead/:id',authGuard,deleteLead);
router.get('/get-query-lead',getQueryLead);
router.get('/get-lead-creator-view',authGuard,getLeadCreaterView);
 router.get('/get-all-job-admin-view/:user_id',authGuard,AdminLeadView);

// FAQ route
router.post('/create-faq',authGuard,createFaq);
router.get('/get-all-faq',getFaq);
router.get('/get-specific-faq/:id',getSpecificFAQ);
router.put('/update-specific-faq/:id',authGuard,updateFaq);
router.delete('/delete-specific-faq/:id',authGuard,deleteFAQ);
router.get('/get-query-faq',queryFAQ);




// contact us
router.post('/create-contact',createContact);
router.get('/get-all-contact',getContact);
router.get('/get-total-contact-count',authGuard,getTotalContactCount);
router.delete('/delete-specific-contact/:id',deleteContact);
router.get('/get-query-contact',queryContact);
router.get('/get-specific-contact/:id',getSpecificContact);
router.put('/update-specific-contact/:id',authGuard,updateContact);

// contact settings (for Contact Us page)
router.get('/get-contact-settings',getContactSettings); // Public endpoint
router.put('/update-contact-settings',authGuard,updateContactSettings); // Admin only

// feedback
router.post('/create-feedback',authGuard,createFeedback);
router.get('/get-all-feedback',getAllFeedback);
router.get('/get-specific-feedback/:id',getSpecificFeedback);
router.put('/update-feedback/:id',authGuard,updateFeedback);
router.delete('/delete-feedback/:id',authGuard,deleteFeedback);
router.get('/get-query-feedback',queryFeedback);
router.get('/get-specific-feedback-admin-view/:id',authGuard,specificFeedbackAdminView);

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

// Agora video/voice call routes
router.post('/generate-call-token', [
  generalAgoraLimit,
  agoraTokenLimit,
  body('channelName')
    .notEmpty()
    .withMessage('Channel name is required')
    .isLength({ min: 1, max: 64 })
    .withMessage('Channel name must be between 1 and 64 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Channel name can only contain letters, numbers, underscores, and hyphens'),

  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('User ID must be between 1 and 255 characters'),

  body('role')
    .optional()
    .isIn(['publisher', 'subscriber'])
    .withMessage('Role must be either "publisher" or "subscriber"')
], agoraController.generateToken);

router.post('/initiate-call', [
  authGuard,
  generalAgoraLimit,
  agoraCallLimit,
  body('calleeId')
    .notEmpty()
    .withMessage('Callee ID is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Callee ID must be between 1 and 255 characters'),

  body('callType')
    .optional()
    .isIn(['voice', 'video'])
    .withMessage('Call type must be either "voice" or "video"'),

  body('callerId')
    .optional() // Can come from auth middleware
    .isLength({ min: 1, max: 255 })
    .withMessage('Caller ID must be between 1 and 255 characters')
], agoraController.initiateCall);

router.post('/answer-call/:callId', [
  authGuard,
  generalAgoraLimit,
  agoraCallLimit,
  param('callId')
    .notEmpty()
    .withMessage('Call ID is required')
    .isUUID()
    .withMessage('Call ID must be a valid UUID'),

  body('userId')
    .optional() // Can come from auth middleware
    .isLength({ min: 1, max: 255 })
    .withMessage('User ID must be between 1 and 255 characters')
], agoraController.answerCall);

router.post('/decline-call/:callId', [
  authGuard,
  generalAgoraLimit,
  agoraCallLimit,
  param('callId')
    .notEmpty()
    .withMessage('Call ID is required')
    .isUUID()
    .withMessage('Call ID must be a valid UUID'),

  body('userId')
    .optional() // Can come from auth middleware
    .isLength({ min: 1, max: 255 })
    .withMessage('User ID must be between 1 and 255 characters')
], agoraController.declineCall);

router.post('/end-call/:callId', [
  authGuard,
  generalAgoraLimit,
  agoraCallLimit,
  param('callId')
    .notEmpty()
    .withMessage('Call ID is required')
    .isUUID()
    .withMessage('Call ID must be a valid UUID'),

  body('userId')
    .optional() // Can come from auth middleware
    .isLength({ min: 1, max: 255 })
    .withMessage('User ID must be between 1 and 255 characters')
], agoraController.endCall);

router.get('/call/:callId', [
  authGuard,
  generalAgoraLimit,
  param('callId')
    .notEmpty()
    .withMessage('Call ID is required')
    .isUUID()
    .withMessage('Call ID must be a valid UUID')
], agoraController.getCall);

router.get('/call-history/:userId', [
  authGuard,
  generalAgoraLimit,
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('User ID must be between 1 and 255 characters')
], agoraController.getCallHistory);

router.get('/agora/status', [
  generalAgoraLimit
], agoraController.getStatus);

// Certificate management routes (admin only)
router.post('/agora/reset-certificate', [
  authGuard,
  generalAgoraLimit
], agoraController.resetToPrimaryCertificate);

router.post('/agora/switch-certificate', [
  authGuard,
  generalAgoraLimit
], agoraController.switchToBackupCertificate);

// FCM notification routes
router.use('/fcm', fcmRoutes);

// Pricing Plan routes
router.post('/create-pricing-plan', authGuard, createPricingPlan);
router.get('/get-all-pricing-plans', getAllPricingPlans);
router.get('/get-pricing-plans-by-category/:category', getPricingPlansByCategory);
router.get('/get-specific-pricing-plan/:id', getSpecificPricingPlan);
router.put('/update-pricing-plan/:id', authGuard, updatePricingPlan);
router.delete('/delete-pricing-plan/:id', authGuard, deletePricingPlan);

// Payment routes
router.post('/create-payment-order', authGuard, createPaymentOrder);
router.post('/verify-payment', authGuard, verifyPayment);
router.get('/get-payment-history', authGuard, getPaymentHistory);
router.get('/get-razorpay-key', getRazorpayKey);

// Chat routes
const chatRoutes = require('./chatRoutes');
          
    router.use('/chat', chatRoutes);

module.exports=router;
