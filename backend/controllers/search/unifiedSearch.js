const createServiceModel = require('../../model/createAllServiceProfileModel');
const jobModel = require('../../model/jobmodel');
const MatrimonyModel = require('../../model/Matrimony');
const PropertyModel = require('../../model/property');
const AdModel = require('../../model/adModel');
const OfferModel = require('../../model/OfferModel');
const NewsModel = require('../../model/NewsPost');

/**
 * Unified search endpoint that searches across all content types
 * Searches: Services, Jobs, Ads, Matrimony, Properties, Offers, News
 */
const unifiedSearch = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({
                message: 'Query parameter is required',
                status: 400,
                success: false,
                error: true
            });
        }

        const regexQuery = new RegExp(query, 'i');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Parallel search across all content types
        const [services, jobs, ads, matrimony, properties, offers, news] = await Promise.all([
            // Search Services
            createServiceModel.find({
                $or: [
                    { yourName: regexQuery },
                    { businessName: regexQuery },
                    { city: regexQuery },
                    { state: regexQuery },
                    { area: regexQuery },
                    { selectCategory: regexQuery },
                    { selectSubCategory: regexQuery },
                    { description: regexQuery },
                    { businessSummary: regexQuery }
                ],
                isActive: true
            }).limit(5).lean(),

            // Search Jobs
            jobModel.find({
                $or: [
                    { title: regexQuery },
                    { yourNameBusinessInstituteFirmCompany: regexQuery },
                    { selectCategory: regexQuery },
                    { selectSubCategory: regexQuery },
                    { description: regexQuery },
                    { address: regexQuery },
                    { pincode: regexQuery }
                ],
                isActive: true
            }).limit(5).lean(),

            // Search Ads
            AdModel.find({
                $or: [
                    { title: regexQuery },
                    { category: regexQuery },
                    { route: regexQuery },
                    { location: regexQuery },
                    { description: regexQuery }
                ],
                isActive: true,
                isVerified: true
            }).limit(5).lean(),

            // Search Matrimony
            MatrimonyModel.find({
                $or: [
                    { fullName: regexQuery },
                    { religion: regexQuery },
                    { caste: regexQuery },
                    { profession: regexQuery },
                    { city: regexQuery },
                    { state: regexQuery },
                    { motherTongue: regexQuery }
                ],
                isActive: true
            }).limit(5).lean(),

            // Search Properties
            PropertyModel.find({
                $or: [
                    { property: regexQuery },
                    { propertyType: regexQuery },
                    { description: regexQuery },
                    { address: regexQuery },
                    { pincode: regexQuery },
                    { fullName: regexQuery }
                ],
                isActive: true
            }).limit(5).lean(),

            // Search Offers
            OfferModel.find({
                $or: [
                    { title: regexQuery },
                    { yourNameBusinessInstituteFirmOrganisation: regexQuery },
                    { selectCategory: regexQuery },
                    { selectSubCategory: regexQuery },
                    { description: regexQuery },
                    { address: regexQuery },
                    { pincode: regexQuery }
                ],
                isActive: true
            }).limit(5).lean(),

            // Search News
            NewsModel.find({
                $or: [
                    { title: regexQuery },
                    { description: regexQuery },
                    { category: regexQuery },
                    { tags: regexQuery }
                ],
                isActive: true
            }).limit(5).lean()
        ]);

        // Format results with type information
        const results = {
            services: services.map(item => ({ ...item, type: 'service' })),
            jobs: jobs.map(item => ({ ...item, type: 'job' })),
            ads: ads.map(item => ({ ...item, type: 'ad' })),
            matrimony: matrimony.map(item => ({ ...item, type: 'matrimony' })),
            properties: properties.map(item => ({ ...item, type: 'property' })),
            offers: offers.map(item => ({ ...item, type: 'offer' })),
            news: news.map(item => ({ ...item, type: 'news' }))
        };

        // Calculate totals
        const totalResults = services.length + jobs.length + ads.length + 
                           matrimony.length + properties.length + offers.length + news.length;

        res.json({
            message: 'Search completed successfully',
            status: 200,
            data: results,
            totalResults,
            query,
            success: true,
            error: false
        });

    } catch (e) {
        console.error('Unified search error:', e);
        res.status(500).json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { unifiedSearch };

