const MatrimonyModel = require('../../model/Matrimony');

const FilterMatrimony = async (req, res) => {
    try {
        // Extract query parameters
        const {
            // Basic Details Filters
            profileCreatedFor,  // 'Self', 'Son', 'Daughter', etc.
            fullName,           // Full name search
            gender,             // 'Male', 'Female'
            maritalStatus,      // 'Never Married', 'Divorced', etc.
            
            // Age Filters
            minAge,             // Minimum age
            maxAge,             // Maximum age
            
            // Physical Attributes
            height,             // Height search
            
            // Religious Information
            religion,           // Religion search
            caste,              // Caste search
            subCaste,           // Sub-caste search
            noCasteBarrier,     // true/false
            
            // Professional Information
            profession,         // Profession search
            qualification,      // highestQualification
            employmentType,     // 'Private Job', 'Government Job', etc.
            annualIncome,       // Income range
            
            // Location Filters
            city,               // City search
            state,              // State search
            pincode,            // Exact pincode match
            
            // Language
            motherTongue,       // Mother tongue search
            
            // Partner Preferences
            partnerMinAge,      // Partner minimum age
            partnerMaxAge,      // Partner maximum age
            partnerCity,        // Partner city preference
            partnerState,       // Partner state preference
            partnerMaritalStatus, // Partner marital status
            partnerEmploymentType, // Partner employment type
            partnerReligion,    // Partner religion
            partnerMotherTongue, // Partner mother tongue
            
            // Search Query (for text search)
            search,
            
            // Pagination
            page = 1,
            limit = 10,
            
            // Sorting
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build dynamic filter object
        const filter = {};
        
        // Basic Details Filters
        if (profileCreatedFor) {
            filter.profileCreatedFor = profileCreatedFor;
        }
        
        if (fullName) {
            filter.fullName = new RegExp(fullName, 'i');
        }
        
        if (gender) {
            filter.gender = gender;
        }
        
        if (maritalStatus) {
            filter.maritalStatus = maritalStatus;
        }
        
        // Age filter (calculated from dateOfBirth)
        if (minAge || maxAge) {
            const today = new Date();
            if (maxAge) {
                const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
                filter.dateOfBirth = { $gte: minDate };
            }
            if (minAge) {
                const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
                if (filter.dateOfBirth) {
                    filter.dateOfBirth.$lte = maxDate;
                } else {
                    filter.dateOfBirth = { $lte: maxDate };
                }
            }
        }
        
        // Array field filters (many fields in matrimony are arrays)
        if (height) {
            filter.height = { $in: [new RegExp(height, 'i')] };
        }
        
        if (religion) {
            filter.religion = { $in: [new RegExp(religion, 'i')] };
        }
        
        if (caste) {
            filter.caste = { $in: [new RegExp(caste, 'i')] };
        }
        
        if (subCaste) {
            filter.subCaste = { $in: [new RegExp(subCaste, 'i')] };
        }
        
        if (profession) {
            filter.profession = { $in: [new RegExp(profession, 'i')] };
        }
        
        if (qualification) {
            filter.highestQualification = { $in: [new RegExp(qualification, 'i')] };
        }
        
        if (employmentType) {
            filter.employmentType = { $in: [employmentType] };
        }
        
        if (annualIncome) {
            filter.annualIncome = { $in: [annualIncome] };
        }
        
        if (city) {
            filter.city = { $in: [new RegExp(city, 'i')] };
        }
        
        if (state) {
            filter.state = { $in: [new RegExp(state, 'i')] };
        }
        
        if (pincode) {
            filter.pincode = { $in: [pincode] };
        }
        
        if (motherTongue) {
            filter.motherTongue = { $in: [motherTongue] };
        }
        
        // Boolean filters
        if (noCasteBarrier !== undefined) {
            filter.noCasteBarrier = noCasteBarrier === 'true';
        }
        
        // Partner Preference Filters
        if (partnerMinAge || partnerMaxAge) {
            const partnerAgeFilter = {};
            if (partnerMinAge) partnerAgeFilter['partnerAge.min'] = { $lte: parseInt(partnerMinAge) };
            if (partnerMaxAge) partnerAgeFilter['partnerAge.max'] = { $gte: parseInt(partnerMaxAge) };
            Object.assign(filter, partnerAgeFilter);
        }
        
        if (partnerCity) {
            filter.partnerCity = { $in: [new RegExp(partnerCity, 'i')] };
        }
        
        if (partnerState) {
            filter.partnerState = { $in: [new RegExp(partnerState, 'i')] };
        }
        
        if (partnerMaritalStatus) {
            filter.partnerMaritalStatus = { $in: [partnerMaritalStatus] };
        }
        
        if (partnerEmploymentType) {
            filter.partnerEmploymentType = { $in: [partnerEmploymentType] };
        }
        
        if (partnerReligion) {
            filter.partnerReligion = { $in: [new RegExp(partnerReligion, 'i')] };
        }
        
        if (partnerMotherTongue) {
            filter.partnerMotherTongue = partnerMotherTongue;
        }

        // General text search across multiple fields
        if (search) {
            filter.$or = [
                { fullName: new RegExp(search, 'i') },
                { moreAboutYourself: new RegExp(search, 'i') },
                { profession: { $in: [new RegExp(search, 'i')] } },
                { highestQualification: { $in: [new RegExp(search, 'i')] } },
                { city: { $in: [new RegExp(search, 'i')] } },
                { state: { $in: [new RegExp(search, 'i')] } },
                { religion: { $in: [new RegExp(search, 'i')] } },
                { caste: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Always filter for active profiles
        filter.isActive = true;

        // Pagination setup
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Sorting setup
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with filters, pagination, and sorting
        const result = await MatrimonyModel
            .find(filter)
            .populate('userId', 'name email phone profileImage')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const total = await MatrimonyModel.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        // Response
        res.json({
            message: 'Matrimony profiles filtered successfully',
            status: 200,
            data: result,
            pagination: {
                total,
                totalPages,
                currentPage: pageNum,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            filters: {
                applied: Object.keys(req.query).filter(key => !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)),
                total: Object.keys(filter).length
            },
            success: true,
            error: false
        });

    } catch (error) {
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { FilterMatrimony };
