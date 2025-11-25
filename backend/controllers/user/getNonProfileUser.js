 let userModel = require('../../model/userModel');
    let createServiceModel = require('../../model/createAllServiceProfileModel');
    let jobModel = require('../../model/jobmodel');
    let PropertyModel = require('../../model/property');
    let OfferModel = require('../../model/OfferModel');
    let AdModel = require('../../model/adModel');
    let NewsModel = require('../../model/NewsPost');
     let LocalServicesModel = require('../../model/localServices');
     let VehiclesModel = require('../../model/vehiclesModel');
     let AllServicesModel = require('../../model/createAllServiceProfileModel');
    let MatrimonyModel = require('../../model/Matrimony');

    const getNonProfileUser = async (req, res) => {
        try {  
  
 let CreateAnySrevice;
 
 let createSrevice=await createServiceModel.find({userId:userId});
 let createJob=await jobModel.find({userId:userId});
 let createProperty=await PropertyModel.find({userId:userId});
 let createOffer=await OfferModel.find({userId:userId});
 let createAd=await AdModel.find({userId:userId});
 let createNews=await NewsModel.find({userId:userId});
 let createLocalServices=await LocalServicesModel.find({userId:userId});
 let createVehicles=await VehiclesModel.find({userId:userId});
 let createMatrimony=await MatrimonyModel.find({userId:userId});
 let createAllServices=await AllServicesModel.find({userId:userId});
 if(createSrevice.length>0 || createJob.length>0 || createProperty.length>0 || createOffer.length>0 || createAd.length>0 || createNews.length>0 || createLocalServices.length>0 || createVehicles.length>0 || createMatrimony.length>0 || createAllServices.length>0){
    CreateAnySrevice=true;
 }else{
    CreateAnySrevice=false;
 }
 
 if(!result || result.length === 0){
                return res.json({
                    message: 'No non-profile users found',
                    status: 404,
                    data: [],
                    success: false,
                    error: true
                });
            }
            //i need only name and email and phone number
            result = result.map((item) => ({
                name: item.name,
                email: item.email,
                phone: item.phone,
                userId: item._id
            }));
            res.json({
                message: 'Non-profile users retrieved successfully',
                status: 200,
                data: result,
                total: result.length,
                success: true,
                error: false
            });
        }
        catch (e) {
            res.json({
                message: 'Something went wrong',
                status: 500,
                data: e.message,
                success: false,
                error: true
            });
        }
    };
    
    module.exports = { getNonProfileUser };

