const serviceListModel = require('../../model/ServiceListModel');

const updateServiceListDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        let userId = req.user._id;
        let existService = await serviceListModel.findById(id);
        
        if (!existService) {
            return res.status(400).json({message: 'Service not found'});
        }

        if (userId.toString() !== existService.userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        // Handle different subcategory operations
        if (payload.operation === 'add_subcategory' && payload.newSubService) {
            // Add new subcategory
            const newSubService = {
                name: payload.newSubService.name,
                image: payload.newSubService.image
            };
            if (newSubService.name && newSubService.image) {
                existService.subService.push(newSubService);
                payload.subService = existService.subService;
            }
        } else if (payload.operation === 'remove_subcategory' && payload.subServiceIndex !== undefined) {
            // Remove subcategory by index
            existService.subService.splice(payload.subServiceIndex, 1);
            payload.subService = existService.subService;
        } else if (payload.operation === 'update_subcategory' && payload.subServiceIndex !== undefined && payload.updatedSubService) {
            // Update specific subcategory
            if (payload.updatedSubService.name && payload.updatedSubService.image) {
                existService.subService[payload.subServiceIndex] = {
                    name: payload.updatedSubService.name,
                    image: payload.updatedSubService.image
                };
                payload.subService = existService.subService;
            }
        } else if (payload.subService && Array.isArray(payload.subService)) {
            // Replace entire subService array
            payload.subService = payload.subService
                .map((item) => ({
                    name: item.name,
                    image: item.image,
                }))
                .filter((item) => item.name && item.image);
        }

        // Remove operation field before update
        delete payload.operation;
        delete payload.newSubService;
        delete payload.subServiceIndex;
        delete payload.updatedSubService;

        const result = await serviceListModel.findByIdAndUpdate(id, payload, {new: true});
        res.json({message: 'Service List updated successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};
        
module.exports = { updateServiceListDetail };
