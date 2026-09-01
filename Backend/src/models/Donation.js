const mongoose = require('mongoose');

const donationSchema  = new mongoose.Schema(
    {
        donorName: {
            type: String,
            required: [true, "Donor name is required"],
            trim: true,
        },
         email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            unique: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
         },
         phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
         },
         donationAmount: {
            type: Number,
            required: [true, "Donation amount is required"],
            min: [1, "Minimum donation is 1Rs"],
         },
         donationType: {
            type: String,
            required: [true, "Please select a donation type"],
            enum: ["Monthly", "One Time", "Annual", "Festival", "In-Kind"],
         },
         paymentMethod: {
            type: String,
            required: [true, "Please select a payment method"],
            enum: ["Online", "UPI", "Cash", "Cheque", "Bank Transfer"],
         },
         donationDate: {
            type: Date,
            required: [true, "Donation date is required"],
        },
        currentStatus: {
            type: String,
            enum: ["Pending", "Completed", "Rejected", "Cancelled"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Donation', donationSchema);