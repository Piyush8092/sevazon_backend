const userModel = require('../../model/userModel'); // ✅ correct import

const getSpecificUser = async (req, res) => {
    try {  
        const id = req.params.id;

        const result = await userModel
            .findById(id).populate('reportAndBlock.reportAndBlockID', 'name email phone profileImage businessName profileType serviceType _id').populate('matrimonyProfileBookmarkID', 'profileCreatedFor fullName phoneNo dateOfBirth gender age maritalStatus height religion caste subCaste noCasteBarrier motherTongue rashiAstroDetails profession highestQualification employmentType annualIncome pincode city state country partnerMinAge partnerMaxAge partnerCity partnerState partnerMaritalStatus partnerEmploymentType partnerReligion partnerMotherTongue isActive isVerified createdAt _id').populate('jobProfileBookmarkID', 'title yourNameBusinessInstituteFirmCompany selectCategory selectSubCategory address pincode description salaryFrom salaryTo salaryPer requiredExperience workMode workShift workType allowCallInApp allowChat isActive isVerified createdAt _id').populate('serviceProfileBookmarkID', 'name email phone profileImage businessName profileType serviceType _id').populate('userId', 'name email phone profileImage businessName profileType serviceType _id');
            
        if (!result) {
            return res.status(404).json({
                message: 'No data found',
                status: 404,
                data: {},
                success: false,
                error: true
            });
        }

        res.status(200).json({
            message: 'User detail retrieved successfully',
            status: 200,
            data: result,
            success: true,
            error: false
        });
    } 
    catch (e) {
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getSpecificUser };
