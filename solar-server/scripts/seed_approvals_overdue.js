import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

import Approval from '../models/approvals/Approval.js';
import ApprovalOverdueRule from '../models/approvals/ApprovalOverdueRule.js';

const EXPECTED_RULES = [
    { ruleName: 'Installer Approvals', type: 'onboarding', key: 'installer', overdueDays: 3, status: 'Active' },
    { ruleName: 'Driver Approvals', type: 'onboarding', key: 'driver', overdueDays: 2, status: 'Active' },
    { ruleName: 'Dealer Approvals', type: 'onboarding', key: 'dealer', overdueDays: 5, status: 'Active' },
    { ruleName: 'Franchisee Approvals', type: 'onboarding', key: 'franchisee', overdueDays: 5, status: 'Active' },
    { ruleName: 'Recruitment Approvals', type: 'company', key: 'recruitment', overdueDays: 4, status: 'Active' },
    { ruleName: 'Combokit Approvals', type: 'company', key: 'combokit', overdueDays: 3, status: 'Active' },
    { ruleName: 'Inventory Approvals', type: 'company', key: 'inventory', overdueDays: 4, status: 'Active' },
    { ruleName: 'Ticket Approvals', type: 'company', key: 'ticket', overdueDays: 2, status: 'Active' },
    { ruleName: 'Standard Project Approvals', type: 'company', key: 'standard', overdueDays: 3, status: 'Active' },
    { ruleName: 'Customize Project Approvals', type: 'company', key: 'customize', overdueDays: 3, status: 'Active' },
    { ruleName: 'Leave Approvals', type: 'company', key: 'leave', overdueDays: 2, status: 'Active' },
    { ruleName: 'Resignation Approvals', type: 'company', key: 'resignation', overdueDays: 2, status: 'Active' }
];

const seedApprovalsOverdue = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        // 1. Ensure all overdue rules are present and Active
        for (const r of EXPECTED_RULES) {
            await ApprovalOverdueRule.findOneAndUpdate(
                { key: r.key },
                { $set: r },
                { upsert: true, new: true }
            );
        }
        console.log('✅ Overdue rules ensured active');

        // 2. Clear existing approvals
        await Approval.deleteMany({});
        console.log('🧹 Existing approval records cleared');

        const now = new Date();
        const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

        const standardLocation = {
            state: "Gujarat",
            district: "Surat",
            cluster: "West GUJ",
            city: "Surat"
        };

        const sampleApprovals = [
            // Installer
            {
                type: 'installer',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Admin',
                requestDate: tenDaysAgo,
                data: {
                    id: "INST-2026-001",
                    installerName: "Ramesh Sharma",
                    businessName: "Sharma Solar Works",
                    mobile: "+91 9876543210",
                    email: "ramesh@sharmasolar.com",
                    address: "45, M.G. Road, Pune",
                    certification: "MNRE Certified Solar PV Installer",
                    experience: "5 Years",
                    requestedBy: "Admin",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },
            {
                type: 'installer',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'HR Team',
                requestDate: oneDayAgo,
                data: {
                    id: "INST-2026-002",
                    installerName: "Manoj Tiwari",
                    businessName: "Tiwari Green Power",
                    mobile: "+91 9123456780",
                    email: "manoj@tiwarigreen.com",
                    address: "Hinjewadi, Pune",
                    certification: "Diploma in Renewable Energy",
                    experience: "2 Years",
                    requestedBy: "HR Team",
                    date: oneDayAgo.toLocaleDateString()
                }
            },

            // Driver
            {
                type: 'driver',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Logistics Mgr',
                requestDate: tenDaysAgo,
                data: {
                    id: "DRV-2026-001",
                    driverName: "Suresh Yadav",
                    licenseNo: "MH-12-2021-987654",
                    mobile: "+91 9822012345",
                    vehicleType: "Tata Ace / Light Commercial",
                    experience: "7 Years",
                    address: "Shivajinagar, Pune",
                    requestedBy: "Logistics Mgr",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },
            {
                type: 'driver',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Logistics Mgr',
                requestDate: oneDayAgo,
                data: {
                    id: "DRV-2026-002",
                    driverName: "Dinesh Kumar",
                    licenseNo: "MH-14-2019-123456",
                    mobile: "+91 9711002233",
                    vehicleType: "Bolero Pickup",
                    experience: "4 Years",
                    address: "Pimpri Chinchwad, Pune",
                    requestedBy: "Logistics Mgr",
                    date: oneDayAgo.toLocaleDateString()
                }
            },

            // Dealer
            {
                type: 'dealer',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Sales Lead',
                requestDate: tenDaysAgo,
                data: {
                    id: "DLR-2026-001",
                    dealerName: "Vikram Malhotra",
                    businessName: "Malhotra Green Energy",
                    mobile: "+91 9911223344",
                    email: "vikram@malhotragreen.com",
                    address: "Kothrud, Pune",
                    gstNo: "27AABCM1234E1Z5",
                    requestedBy: "Sales Lead",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },

            // Franchisee
            {
                type: 'franchisee',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Expansion Mgr',
                requestDate: tenDaysAgo,
                data: {
                    id: "FRN-2026-001",
                    franchiseeName: "Amit Patel",
                    businessName: "Patel Solar Hub",
                    mobile: "+91 9833445566",
                    email: "amit.patel@solarhub.in",
                    address: "Navi Mumbai, Maharashtra",
                    investment: "₹25,000,000",
                    requestedBy: "Expansion Mgr",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },

            // Recruitment
            {
                type: 'recruitment',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'HR Manager',
                requestDate: tenDaysAgo,
                data: {
                    id: "REC-2026-001",
                    hiringPosition: "Senior Design Engineer",
                    name: "Senior Design Engineer",
                    candidateName: "Pooja Joshi",
                    candidateMobile: "+91 9765432109",
                    candidateEmail: "pooja.j@gmail.com",
                    salaryBudget: "₹12,00,000 / yr",
                    ageCriteria: "25-38",
                    gender: "Female",
                    education: "B.Tech in Electrical Engg",
                    experience: "6 Years",
                    requestedBy: "HR Manager",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },

            // Combokit
            {
                type: 'combokit',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Product Mgr',
                requestDate: tenDaysAgo,
                data: {
                    id: "KIT-2026-001",
                    name: "Premium 5kW Hybrid Combo",
                    solarpanelbrand: "Vikram Solar",
                    panelsku: "VS-550W-MONO",
                    inverter: "Growatt 5kW Hybrid",
                    invertorsku: "GW-5K-HYB",
                    boskitbrand: "Solarkits Premium BOS",
                    boskitsku: "SK-BOS-5K",
                    cptype: "Residential Roof",
                    district: "Pune",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },

            // Inventory
            {
                type: 'inventory',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Warehouse Mgr',
                requestDate: tenDaysAgo,
                data: {
                    id: "INV-2026-001",
                    productType: "Solar Inverter",
                    name: "Luminous Solar Hybrid Inverter 3kVA",
                    brand: "Luminous",
                    sku: "LUM-3KVA-HYB",
                    modelNo: "NXG 3050",
                    quantity: "50 Units",
                    requestedBy: "Warehouse Mgr",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },

            // Ticket
            {
                type: 'ticket',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Support Team',
                requestDate: tenDaysAgo,
                data: {
                    id: "TCK-2026-001",
                    issueType: "Inverter Fault",
                    name: "Inverter showing E-102 Error Code",
                    priority: "High",
                    customerName: "Dr. Anand Rao",
                    customerPhone: "+91 9422001122",
                    assignedTo: "Rajesh (Field Tech)",
                    estimatedResolution: "24 Hours",
                    modules: ["Inverter", "Wiring"],
                    timeline: [
                        { step: "Ticket Created", date: tenDaysAgo.toLocaleDateString(), status: "completed" },
                        { step: "Inspection Assigned", date: "Pending", status: "current" }
                    ],
                    requestedBy: "Support Team",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },

            // Standard Project
            {
                type: 'standard',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Project Team',
                requestDate: tenDaysAgo,
                data: {
                    id: "STD-2026-001",
                    name: "Standard 3kW On-Grid Kit",
                    solarpanelbrand: "Waaree",
                    panelsku: "WR-540W",
                    inverter: "Havells 3kW",
                    invertorsku: "HAV-3K-OG",
                    boskitbrand: "Standard BOS",
                    boskitsku: "BOS-3K-STD",
                    cptype: "Residential On-Grid",
                    district: "Pune",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },

            // Customize Project
            {
                type: 'customize',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Enterprise Sales',
                requestDate: tenDaysAgo,
                data: {
                    id: "CUST-2026-001",
                    name: "Custom 10kW Commercial Setup",
                    solarPanel: "Adani Solar 540W Mono PERC",
                    inverter: "Sungrow 10kW On-Grid",
                    battery: "Exide Tubular 150Ah x8",
                    mounting: "HDG Steel Elevated Structure",
                    wiring: "Polycab DC 6sqmm",
                    accessories: "ACDB, DCDB, Earthing Kit",
                    totalCost: "₹6,80,000",
                    requestedBy: "Enterprise Sales",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },

            // Leave
            {
                type: 'leave',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Nitin Gadkari',
                requestDate: tenDaysAgo,
                data: {
                    id: "LEV-2026-001",
                    employeeName: "Nitin Gadkari",
                    leaveType: "Annual Leave / Vacation",
                    startDate: "2026-06-01",
                    endDate: "2026-06-07",
                    reason: "Family Vacation",
                    requestedBy: "Nitin Gadkari",
                    date: tenDaysAgo.toLocaleDateString()
                }
            },

            // Resignation
            {
                type: 'resignation',
                status: 'Pending',
                location: standardLocation,
                requestedBy: 'Sanjay Dutt',
                requestDate: tenDaysAgo,
                data: {
                    id: "RES-2026-001",
                    employeeName: "Sanjay Dutt",
                    reason: "Pursuing higher education abroad",
                    noticePeriod: "30 Days",
                    lastWorkingDay: "2026-06-18",
                    requestedBy: "Sanjay Dutt",
                    date: tenDaysAgo.toLocaleDateString()
                }
            }
        ];

        await Approval.insertMany(sampleApprovals);
        console.log(`🎉 Successfully seeded ${sampleApprovals.length} approval requests (with overdue items for all categories)`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding approvals overdue data:', error);
        process.exit(1);
    }
};

seedApprovalsOverdue();
