export async function dataStore(Model, data) {
    try {
        const result = await Model.create(data);
        return result;
    } catch (error) {
        throw new Error(`Error while storing data: ${error.message}`);
    }
}

export async function dataUpdate(Model, id, data) {
    try {
        const updated = await Model.findByIdAndUpdate(id, data, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation rules are applied
        });
        if (!updated) {
            throw new Error(`No record found with ID: ${id}`);
        }
        return updated;
    } catch (error) {
        throw new Error(`Error while updating data: ${error.message}`);
    }
}

export async function getData(Model, id) {
    try {
        const fetchDetail = await Model.findById(id);
        if (!fetchDetail) {
            throw new Error(`No record found with ID: ${id}`);
        }
        return fetchDetail;
    } catch (error) {
        throw new Error(`Error while fetching data: ${error.message}`);
    }
}

export async function getAll(Model, filter = {}) {
    try {
        const allDetails = await Model.find(filter); // Use filter to allow conditional queries
        return allDetails;
    } catch (error) {
        throw new Error(`Error while fetching all data: ${error.message}`);
    }
}

export async function deleteOne(Model, id) {
    try {
        const deleted = await Model.findByIdAndDelete(id);
        if (!deleted) {
            throw new Error(`No record found with ID: ${id}`);
        }
        return deleted;
    } catch (error) {
        throw new Error(`Error while deleting data: ${error.message}`);
    }
}

class BaseController {
    successResponse(res, message, data = {}) {
        res.status(200).json({
            status: "success",
            message,
            data,
        });
    }

    createdResponse(res, message, data = {}) {
        res.status(201).json({
            status: "success",
            message,
            data,
        });
    }

    errorResponse(res, statusCode, message) {
        res.status(statusCode).json({
            status: "error",
            message,
        });
    }
}

export default BaseController;
