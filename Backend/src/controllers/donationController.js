const Donation = require('../models/Donation');

// Get All Donations (with search, filter, pagination)

const getDonations = async(req, res)=>{
    try{
        const{
        page = 1,
        limit= 5,
        search="",
        donationType="",
        paymentMethod="",
        currentStatus="",
        fromDate="",
        toDate="",
        } = req.query;

        //filter objects

        const filter = {};

        //Search by name and email

        if(search){
            filter.$or = [
                {donorName:{$regex: search, $options:"i"}},
                {email:{$regex: search, $options:"i"}},
            ];
        }

        if(donationType) filter.donationType = donationType;
        if(paymentMethod) filter.paymentMethod = paymentMethod;
        if(currentStatus) filter.currentStatus = currentStatus;

        //Date range filter

        if(fromDate || toDate){
            filter.donationDate = {};
            if(fromDate) filter.donationDate.$gte = new Date(fromDate);
            if(toDate) filter.donationDate.$lte = new Date(toDate);    
        }

        //Pagination
        
        const pagenum = parseInt(page);
        const limitnum = parseInt(limit);
        const skip = (pagenum - 1) * limitnum; 

        const totalDonations = await Donation.countDocuments(filter);
        const donations = await Donation.find(filter).sort({createdAt: -1}).skip(skip).limit(limitnum); 

        res.status(200).json({
            success: true,
            count: donations.length,
            total: totalDonations,
            totalPages: Math.ceil(totalDonations / limitnum),
            currentPage: pagenum,
            donations,
        });
    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }
};

// Get Single Donation

const getDonationById = async (req,res) =>{
    try{
        const donation = await Donation.findById(req.params.id);

        if(!donation){
            return res.status(404).json({
                success: false, message: "Donation not found"
            });
        }
        res.status(200).json({
            success: true, donation
        });
    } catch(error){
        res.status(500).json({
            success: false, message: error.message
        });
    }
};

// Create Donation

const createDonation = async(req,res)=>{
    try{
        const donation = await Donation.create(req.body);
        res.status(201).json({
            success: true,     
            message: "Donation created successfully", donation
        });
    } catch(error){
        if(error.code === 11000){
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            const fieldLabel = field === 'email' ? 'Email address' : field === 'phone' ? 'Phone number' : field;
            return res.status(400).json({
                success: false,
                message: `${fieldLabel} "${value}" is already associated with another donor.`
            });
        }
        if(error.name === "ValidationError"){
            const messages = Object.values(error.errors).map((e)=> e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(", ") });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Donation

const updateDonation = async(req,res)=>{
    try{
        const donation  = await Donation.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        if(!donation){
            return res.status(404).json({
                success: false,
                message: "Donation not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Donation Updated Successfully",
            donation
        });
    } catch(error){
        if(error.code === 11000){
            const field = Object.keys(error.keyValue)[0];
            const value = error.keyValue[field];
            const fieldLabel = field === 'email' ? 'Email address' : field === 'phone' ? 'Phone number' : field;
            return res.status(400).json({
                success: false,
                message: `${fieldLabel} "${value}" is already associated with another donor.`
            });
        }
        if(error.name === "ValidationError"){
            const messages = Object.values(error.errors).map((e)=>e.message);
            return res.status(400).json({
                success:false,
                message: messages.join(", ")
            });
        }
        res.status(500).json({
            success:false,
            message: error.message
        });
    }
};

// Delete Donation

const deleteDonation = async(req,res) =>{
    try{
        const donation = await Donation.findByIdAndDelete(req.params.id);
        
        if(!donation){
            return res.status(404).json({ 
                success: false,            
                message:"Donation not found"
            });
        }
        res.status(200).json({
            success:true,
            message: "Donation Deleted Successfully"
        });
    } catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Dashboard Stats

const getDashboardStats = async(req,res)=>{
    try{
        // Only count Completed donations for all dashboard stats
        const COMPLETED = { currentStatus: "Completed" };

        // Total completed donations count
        const totalDonations = await Donation.countDocuments(COMPLETED);

        // Total completed donation amount
        const totalAmountResult = await Donation.aggregate([
            {$match: COMPLETED},
            {$group: { _id: null, total: {$sum: "$donationAmount"}}}
        ]);
        const totalAmount = totalAmountResult[0]?.total || 0;

        // Completed donations breakdown by type
        const donationsByType = await Donation.aggregate([
            {$match: COMPLETED},
            {$group: {_id: "$donationType", count: {$sum: 1}, amount: {$sum: "$donationAmount"}}}
        ]);

        // Completed donations breakdown by payment method
        const donationsByPayment = await Donation.aggregate([
            {$match: COMPLETED},
            {$group: {_id: "$paymentMethod", count:{$sum: 1}}}
        ]);

        // 5 most recent completed donations
        const recentDonations = await Donation.find(COMPLETED).sort({createdAt: -1}).limit(5);

        // This month's completed donations (filtered by donationDate)
        const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const thisMonthDonations = await Donation.countDocuments({
            ...COMPLETED,
            donationDate: {$gte: thisMonthStart},
        });

        const thisMonthAmountResult = await Donation.aggregate([
            {$match: {...COMPLETED, donationDate: {$gte: thisMonthStart}}},
            {$group: {_id: null, total: {$sum: "$donationAmount"}}},
        ]);
        const thisMonthAmount = thisMonthAmountResult[0]?.total || 0;

        res.status(200).json({
            success: true,
            stats:{
                totalDonations,
                totalAmount,
                thisMonthDonations,
                thisMonthAmount,
                donationsByType,
                donationsByPayment,
                recentDonations,
            },
        });
    } catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getDonations,
    getDonationById,
    createDonation,
    updateDonation,
    deleteDonation,
    getDashboardStats,
};