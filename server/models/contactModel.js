import mongoose from "mongoose";
const contactSchema = new mongoose.Schema({
    fullName: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true, lowercase: true},
    phone: {type: String, trim: true, default: ""},
    subject: {type: String, required: true, enum: ["general", "order", "returns", "feedback", "other"]},
    message: {type: String, required: true, trim: true},
    status: {type: String, enum: ["new", "read", "replied"], default: "new"}
}, {timestamps: true});

const contactModel = mongoose.models.contact || mongoose.model("contact", contactSchema);
export default contactModel;