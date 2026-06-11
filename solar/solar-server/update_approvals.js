import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Approval from './models/approvals/Approval.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        await Approval.updateMany({}, {
            $set: {
                "location.state": "Gujarat",
                "location.cluster": "West GUJ",
                "location.district": "Surat",
                "location.city": "Surat"
            }
        });
        console.log("Updated all approvals to Gujarat / West GUJ / Surat");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
});
