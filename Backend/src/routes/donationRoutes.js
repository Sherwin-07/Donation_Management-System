const express = require("express");
const router = express.Router();

const{
    getDonations,
    getDonationById,
    createDonation,
    updateDonation,
    deleteDonation,
    getDashboardStats,
} = require("../controllers/donationController");

router.get("/dashboard", getDashboardStats);
router.route("/").get(getDonations).post(createDonation);
router.route("/:id").get(getDonationById).put(updateDonation).delete(deleteDonation);

module.exports = router;

