import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        unique: true,
        required: true
    },
    alias: {
        type: String,
        unique: true
    },
    group: {
        type: String
    },
    analytics: [
        {
            timestamp: {
                type: Date,
                default: Date.now
            },
            ip: String,
            geolocation: Object,
            device: String,
            os: String,
        },
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        required: true,
        ref: 'User' // Assumes you have a User model
    }
},
    { timestamps: true }
)
urlSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});
const URL = mongoose.model('URL', urlSchema)
export default URL;