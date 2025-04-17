const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const nodemailer = require('nodemailer');
const app = express();
const path = require("path");
const fs = require("fs");
const generatePDF = require("./generatePDF");
// Middleware
app.use(express.json());
app.use(cors());
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });
function randomNumber() {
  const prefix = "VOL";
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000); // 8-digit random number
  return `${prefix}-${year}-${randomNumber}`;
}
function generateUniqueValue() {
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000); // 8-digit random number
  return randomNumber;
}
app.use('/uploads', express.static('uploads'));
// Connect to MongoDB
mongoose.connect("mongodb+srv://valmologestic:sanjay9523@cluster0.tb1f0.mongodb.net/Valmo?retryWrites=true&w=majority&appName=Cluster0", {
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
// Define Schema and Model
const LeadSchema = new mongoose.Schema({
  username: String,
  email: String,
  mobile: String,
  pincode: String,
  state: String,
  follow1: {
    type: Boolean,
    default: false
  },
  follow2: {
    type: Boolean,
    default: false
  },
  follow3: {
    type: Boolean,
    default: false
  },
  AssignedBank: {
    type: String,
    default: null
  },
  district: String,
  selectedPostOfficeList: Array,
  approval_fees: String,
  agreementFees: String,
  securityMoney: String,
  father_name: String,
  address: String,
  photo: String,
  aadhar: String,
  pan: String,
  pincodes: Array,
  applicationNumber: String,
  documentNumber: String,
  account_number: String,
  ifsc: String,
  branch: String,
  holder_name: String,
  bank_name: String,
  block: {
    type: Boolean,
    default: false
  },
  uploadedAl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});
const Lead = mongoose.model('Lead', LeadSchema);
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  unique_code: { type: String, required: true, unique: true },
  proposalList: { type: Array, default: [] },
  leadList: { type: Array, default: [] },
  personalMailedForm: { type: Array, default: [] },
  block: { type: Boolean, default: false },
});
const User = mongoose.model('manager', userSchema);
const proposalSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  selectedRange: String,
  pincodes: Array,
  follow1: {
    type: Boolean,
    default: false
  },
  follow2: {
    type: Boolean,
    default: false
  },
  follow3: {
    type: Boolean,
    default: false
  },

  state: String,
  district: String,
  post_offices: Array,
}, {
  timestamps: true
});
const proposal = mongoose.model('proposal', proposalSchema);
const bankSchema = new mongoose.Schema({
  bank_name: String,
  account_number: String,
  ifsc: String,
  branch: String,
  holder_name: String,

}, {
  timestamps: true
});
const bank = mongoose.model('bank', bankSchema);
const FranchiseSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  contact_number: {
    type: String,
    required: true,
    trim: true
  },
  pin_code: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  Franchise_type: {
    type: String,
    enum: ["Delivery Franchise", "District Franchise Hub"], // Allowed values
    default: "Delivery Franchise"
  },
  state: {
    type: String,
    default: "SelectState"
  },
  district: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true }); // Adds createdAt & updatedAt
const Franchise = mongoose.model("Franchise", FranchiseSchema);
app.get('/', async (req, res) => {
  res.send('f9fff')
})

app.get('/al', async (req, res) => {
  generatePDF(req, res)
})



app.post('/create-user', async (req, res) => {
  const { name, id, mobile, unique_code } = req.body;

  // Validate input
  if (!name || !mobile || !unique_code) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  if (unique_code.length !== 4 || isNaN(unique_code)) {
    return res.status(400).json({ message: 'Unique code must be a 4-digit number!' });
  }

  try {
    // Check if mobile or unique_code already exists

    if (id) {
      const existingUser = await User.findByIdAndUpdate(id, { ...req.body });
      return res.status(201).json({ message: 'User updated successfully!', });
    }


    const existingUser = await User.findOne({ $or: [{ mobile }, { unique_code }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Mobile number or unique code already exists!' });
    }

    // Create new user
    const newUser = new User({ name, mobile, unique_code });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully!', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error!' });
  }
});
app.post('/view-user', async (req, res) => {
  const { id } = req.body;

  // Validate input




  try {
    // Check if mobile or unique_code already exists

    if (id) {
      const existingUser = await User.findById(id);
      return res.status(201).json({ message: 'User created successfully!', user: existingUser });
    }


    return res.status(400).json({ message: 'Mobile number or unique code already exists!' });





  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error!' });
  }
});
app.get('/users', async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({})

    // Get the current date and calculate dates for today, yesterday, and last 7 days
    const currentDate = new Date();
    const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfLast7Days = new Date(startOfToday);
    startOfLast7Days.setDate(startOfLast7Days.getDate() - 7);

    // Fetch all leads created in the last 7 days
    const leads = await proposal.find({
      createdAt: { $gte: startOfLast7Days },
    });

    // Map users with their proposal statistics
    const usersWithStats = users.map(user => {
      // Ensure proposalList is always an array
      const proposalList = user.proposalList || [];

      const userLeads = leads.filter(lead => proposalList.includes(lead._id));

      const todayLeads = userLeads.filter(lead => lead.createdAt >= startOfToday);
      const yesterdayLeads = userLeads.filter(lead => lead.createdAt >= startOfYesterday && lead.createdAt < startOfToday);
      const last7DaysLeads = userLeads.filter(lead => lead.createdAt >= startOfLast7Days);

      return {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        unique_code: user.unique_code,
        block: user.block,
        proposalList: proposalList, // Ensure proposalList is always an array
        proposals: {
          today: todayLeads.length,
          yesterday: yesterdayLeads.length,
          last7Days: last7DaysLeads.length,
        },
      };
    });

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error });
  }
});
// Endpoint to block/unblock a user
app.put('/users/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body;

    const user = await User.findByIdAndUpdate(id, { block }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.json({ message: `User ${block ? 'blocked' : 'unblocked'} successfully!`, user });
  } catch (error) {
    console.error('Error updating user block status:', error);
    res.status(500).json({ message: 'Error updating user block status', error });
  }
});
app.put('/users/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;


    const user = await User.findByIdAndDelete(id, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.json({ message: `User Deleted successfully!`, user });
  } catch (error) {
    console.error('Error updating user block status:', error);
    res.status(500).json({ message: 'Error updating user block status', error });
  }
});
// Create Lead Route
app.post('/create-lead', upload.fields([
  { name: 'photo', maxCount: 1 },

]), async (req, res) => {

  try {

    console.log(req.body)

    if (req.body.id) {
      const lead = await Lead.findByIdAndUpdate(req.body.id, {
        username: req.body.username,
        email: req.body.email,
        //applicationNumber:Math.random().toString(36).substring(7),
        // documentNumber:Math.random().toString(36).substring(7),
        mobile: req.body.mobile,
        pincode: req.body.pincode,
        state: req.body.state,
        district: req.body.district,
        selectedPostOfficeList: req.body.selectedPostOfficeList,
        approval_fees: req.body.approval_fees,
        agreementFees: req.body.agreementFees,
        securityMoney: req.body.securityMoney,
        father_name: req.body.father_name,
        address: req.body.address,
        // photo: req?.files['photo'][0]?.path,
        pincodes: req.body.pincodes ? JSON.parse(req.body.pincodes) : [],
        aadhar: req.body.aadhar,
        pan: req.body.pan,
        account_number: req.body.account_number,
        ifsc: req.body.ifsc,
        branch: req.body.branch,
        holder_name: req.body.holder_name,
        bank_name: req.body.bank_name
      }, { new: true });


      return res.json({ message: 'Lead created and assigned successfully!', lead: lead });
    }






    const newLead = new Lead({
      username: req.body.username,
      email: req.body.email,
      applicationNumber: generateUniqueValue(),
      documentNumber: randomNumber(),
      mobile: req.body.mobile,
      pincode: req.body.pincode,
      district: req.body.district,
      selectedPostOfficeList: req.body.selectedPostOfficeList,
      state: req.body.state,
      approval_fees: req.body.approval_fees,
      agreementFees: req.body.agreementFees,
      securityMoney: req.body.securityMoney,
      father_name: req.body.father_name,
      address: req.body.address,
      photo: req.files['photo'] ? req.files['photo'][0].path : null,
      aadhar: req.body.aadhar,
      pan: req.body.pan,
      account_number: req.body.account_number,
      account_number: req.body.account_number,
      ifsc: req.body.ifsc,
      branch: req.body.branch,
      pincodes: req.body.pincodes ? JSON.parse(req.body.pincodes) : [],
      holder_name: req.body.holder_name,
      bank_name: req.body.bank_name
    });

    // Save the new lead
    const savedLead = await newLead.save();

    return res.json({ message: 'Lead created and assigned successfully!', lead: savedLead });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating lead', error });
  }
});
app.post('/create-lead-By-Manager', upload.fields([
  { name: 'photo', maxCount: 1 },

]), async (req, res) => {

  try {

    let user
    if (req.body.managerid) {
      user = await User.findOne({ unique_code: req.body.managerid })
    }
    if (req.body.id) {
      const lead = await Lead.findByIdAndUpdate(req.body.id, {
        username: req.body.username,
        email: req.body.email,
        //applicationNumber:Math.random().toString(36).substring(7),
        // documentNumber:Math.random().toString(36).substring(7),
        mobile: req.body.mobile,
        pincodes: req.body.pincodes ? JSON.parse(req.body.pincodes) : [],

        pincode: req.body.pincode,
        state: req.body.state,
        district: req.body.district,
        selectedPostOfficeList: req.body.selectedPostOfficeList,
        approval_fees: req.body.approval_fees,
        agreementFees: req.body.agreementFees,
        securityMoney: req.body.securityMoney,
        father_name: req.body.father_name,
        address: req.body.address,
        // photo: req.files['photo'][0].path,
        aadhar: req.body.aadhar,
        pan: req.body.pan,
        account_number: req.body.account_number,
        ifsc: req.body.ifsc,
        branch: req.body.branch,
        holder_name: req.body.holder_name,
        bank_name: req.body.bank_name
      }, { new: true })
      return res.json({ message: 'Lead created and assigned successfully!', lead: savedLead });

    }






    const newLead = new Lead({
      username: req.body.username,
      email: req.body.email,
      applicationNumber: generateUniqueValue(),
      documentNumber: randomNumber(),
      mobile: req.body.mobile,
      pincode: req.body.pincode,
      pincodes: req.body.pincodes ? JSON.parse(req.body.pincodes) : [],

      district: req.body.district,
      selectedPostOfficeList: req.body.selectedPostOfficeList,
      state: req.body.state,
      approval_fees: req.body.approval_fees,
      agreementFees: req.body.agreementFees,
      securityMoney: req.body.securityMoney,
      father_name: req.body.father_name,
      address: req.body.address,
      photo: req.files['photo'][0].path,
      aadhar: req.body.aadhar,
      pan: req.body.pan,
      account_number: req.body.account_number,
      account_number: req.body.account_number,
      ifsc: req.body.ifsc,
      branch: req.body.branch,
      holder_name: req.body.holder_name,
      bank_name: req.body.bank_name
    });

    // Save the new lead
    const savedLead = await newLead.save();
    user.leadList.push(savedLead._id);
    await user.save();
    res.json({ message: 'Lead created and assigned successfully!', lead: savedLead });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating lead', error });
  }
});

const storageForAL = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const uploadForAL = multer({ storage: storageForAL });

app.post("/uploadALetter", uploadForAL.single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    await Lead.findByIdAndUpdate(req.body.userId, {
      uploadedAl: req.file.path,

    }
    )

    res.json({ message: "PDF uploaded successfully", filePath: req.file.path });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});


app.get("/view/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead || !lead.uploadedAl) {
      return res.status(404).json({ message: "Lead or file not found" });
    }
    console.log(path.join(__dirname, "uploads", lead.uploadedAl))
    const filePath = path.join(__dirname, lead.uploadedAl);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const st = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const updload = multer({ storage: st });

const personalMailedFormSchema = new mongoose.Schema({
  user: String,
  selectedModal: String,

  // File paths
  fileInput: String,
  aadhaarInput: String,
  aadhaarBackInput: String,
  panInput: String,
  bankInput: String,

  // Text fields
  applicationNumber: String,
  applicationDate: String,
  fullName: String,
  fatherHusbandName: String,
  dob: String,
  passportNumber: String,
  nationality: String,
  mobileNumber: String,
  alternateMobileNumber: String,
  email: String,
  houseStreet: String,
  resDistrict: String,
  resState: String,
  resPinCode: String,
  businessName: String,
  gstNumber: String,
  employeesCount: String,
  officeAddress: String,
  officeDistrict: String,
  officeState: String,
  officePinCode: String,
  franchisePinCode: String,
  totalSpace: String,
  warehouseSpace: String,
  expectedRevenue: String,
  bankName: String,
  bankBranch: String,
  accountHolder: String,
  accountNumber: String,
  ifscCode: String,
  upiId: String,
  franchiseCompany: String,
  disputesDetails: String,
  ref1Name: String,
  ref1Contact: String,
  ref1Relationship: String,
  ref2Name: String,
  ref2Contact: String,
  ref2Relationship: String,
  professionalBackground: String,
  certifications: String,
  experienceDetails: String,
  staffCount: String,
  remarks: String,
  reviewedBy: String,
  reviewerSignature: String,
  reviewDate: String,

  // Checkboxes and conditionals
  investmentBelow5: Boolean,
  investment5to10: Boolean,
  investment10to20: Boolean,
  investmentAbove20: Boolean,

  sourceSelf: Boolean,
  sourceLoan: Boolean,
  sourcePartner: Boolean,
  sourceOther: Boolean,
   password:{
    type: String,
    default:Math.random().toString(36).substring(4)
   },
  loansYes: Boolean,
  loansNo: Boolean,
  vehiclesYes: Boolean,
  vehiclesNo: Boolean,
  logisticsFamiliarYes: Boolean,
  logisticsFamiliarNo: Boolean,

  qual10th: Boolean,
  qual12th: Boolean,
  qualDiploma: Boolean,
  qualGraduate: Boolean,
  qualPostgraduate: Boolean,
  qualOther: Boolean,

  franchiseYes: Boolean,
  franchiseNo: Boolean,
  disputesYes: Boolean,
  disputesNo: Boolean,
  experienceYes: Boolean,
  experienceNo: Boolean,

  statusApproved: Boolean,
  statusRejected: Boolean,
  statusUnderReview: Boolean,
  isBlocked:{
    type:Boolean,
    default:false
  },
  bankRemark:{
    type:String,  
    default:""
  },
  bankQr:{
    type:String,  
    default:""
  },

  approvalNote:{
    type:String,  
    default:""
  },
  agreementNote:{
    type:String,  
    default:""
  },






  thebusinesspremises: String,
  ParkingFacilityAvailable: String,
  OfficeSetupAvailability: String,
  typeOfBusiness: String,
  PreferredModeofCommunication: String,
  maritalStatus: String,
  gender: String
}, { timestamps: true });

const personalMailedForm = mongoose.model('personalMailedForm', personalMailedFormSchema);







app.post('/api/personal-application', upload.fields([
  { name: 'aadharCard', maxCount: 11 },
  { name: 'backAdharCard', maxCount: 11 },
  { name: 'panCard', maxCount: 11 },
  { name: 'propertyDocuments', maxCount: 11 },
  { name: 'bankProof', maxCount: 11 },
  { name: 'photo', maxCount: 11 },
]), async (req, res) => {
  try {




    // Process the form data
    const formData = req.body;

    // Check if files were uploaded
    const files = req.files || {};

    // Create new form with file paths
    const newForm = new personalMailedForm({
      ...formData,
      aadhar: files.aadharCard?.[0]?.filename || null,
      backAdharCard: files.backAdharCard?.[0]?.filename || null,
      panCard: files.panCard?.[0]?.filename || null,
      propertyDocuments: files.propertyDocuments?.[0]?.filename || null,
      bankProof: files.bankProof?.[0]?.filename || null,
      photo: files.photo?.[0]?.filename || null,
    });

    // Save the form
    await newForm.save();

    // Update user with the new form reference
    if (req.query.userid) {
      await User.findOneAndUpdate(
        { unique_code: req.query.userid },
        { $push: { personalMailedForm: newForm._id } }
      );
    }

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: newForm
    });
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing application',
      error: error.message
    });
  }
});







 
app.post("/submit-application", upload.fields([
    { name: "fileInput" },
    { name: "aadhaarInput" },
    { name: "aadhaarBackInput" },
    { name: "panInput" },
    { name: "bankInput" }
]), async (req, res) => {
    try {
        const body = req.body;
       console.log(req.query)
        // Append file paths
        body.fileInput = req.files.fileInput?.[0]?.filename || "";
        body.aadhaarInput = req.files.aadhaarInput?.[0]?.filename || "";
        body.aadhaarBackInput = req.files.aadhaarBackInput?.[0]?.filename || "";
        body.panInput = req.files.panInput?.[0]?.filename || "";
        body.bankInput = req.files.bankInput?.[0]?.filename || "";

        // Save to DB
        const savedForm = await personalMailedForm.create(body);
        // Update user with the new form reference
        if (req.query.user) {
            await User.findOneAndUpdate(
                { unique_code: req.query.user },
                { $push: { personalMailedForm: savedForm._id } }
            );
          
        }

        res.status(200).json({ message: "Form submitted successfully", data: savedForm });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Form submission failed" });
    }
});









app.post('/franchise', async (req, res) => {
  console.log(req.body)
  try {

    const newLead = new Franchise(req.body);

    await newLead.save();
    res.json({ message: 'Lead created successfully!' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating lead', error });
  }
});
app.post('/franchise', async (req, res) => {

  try {

    const newLead = new Franchise(req.body);

    await newLead.save();
    res.json({ message: 'Lead created successfully!' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating lead', error });
  }
});
app.post('/create-bank', async (req, res) => {
  try {
    const { account_number, ifsc, branch, bank_name, holder_name } = req.body;

    // Find the bank by account_number and update or create a new document
    const updatedBank = await bank.findOneAndUpdate(
      { account_number }, // Find by account_number
      {
        ifsc,
        branch,
        bank_name,
        holder_name
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if none is found
      }
    );

    res.json({ message: 'Bank details updated or created successfully!', bank: updatedBank });
  } catch (error) {
    res.status(500).json({ message: 'Error creating or updating bank details', error });
  }
});
app.get('/usersList', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
})
app.get('/usersList/:id', async (req, res) => {
  try {
    const user = await User.findOne({ unique_code: req.params.id })
    const leads = await personalMailedForm.find({ _id: { $in: user.personalMailedForm } }).sort({ createdAt: -1 });
    console.log(leads)
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
})
app.get('/personalmaileddelete/:id', async (req, res) => {
  try {
    const leads = await personalMailedForm.findByIdAndDelete(req.params.id)
    console.log(leads)
    res.json(leads);

  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
})
app.get('/uproovalmail/:id/:mangerId', async (req, res) => {
  try {
    const leads = await personalMailedForm.findById(req.params.id)
    leads.approvalNote = "Approved"
    await leads.save()
    const m = await User.findOne({ unique_code: req.params.mangerId })
     
    send2Mail(leads)
    res.json(leads);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
})
app.get('/paymentConfirmationMail/:id/:mangerId', async (req, res) => {
  try {
    const leads = await personalMailedForm.findById(req.params.id)
    const m = await User.findOne({ unique_code: req.params.mangerId })
    console.log(leads, m)
    paymentConfirmationMail(leads, m)
    res.json(leads);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
})


const paymentConfirmationMail = async (user, paymentDetails) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "hello@valmodelivery.com",
      pass: "Sanjay@9523"
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  });

  const mailOptions = {
    from: '"Valmo Logistics" <hello@valmodelivery.com>',
    to: user.email,
    subject: '✅ Payment Received – PIN Code Booking Confirmation',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); padding: 30px;">
         

          <p style="font-size: 18px;">Dear <strong>${user.fullName}</strong>,</p>

          <p>Greetings from <strong style="color: #3366cc;">Valmo Logistics</strong>!</p>

          <p>We are pleased to inform you that we have successfully received your payment of <strong>₹18,600</strong> for the PIN code booking of your franchise application.</p>

          <div style="background-color: #f1f6ff; border-left: 4px solid #3366cc; padding: 15px 20px; margin: 25px 0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #003366;">📍 Booking Details</h3>
            <p><strong>Amount Received:</strong> ₹18,600</p>
            <p><strong>Purpose:</strong> PIN Code Registration & Booking</p>
            <p><strong>PIN Code Booked:</strong> ${user.officePinCode}</p>
            <p><strong>Location:</strong> ${user.officeAddress}</p>
          </div>

          <p>Your PIN code has now been officially <strong style="color: green;">reserved under your name</strong>, and no further bookings will be accepted for this location.</p>

          <p>This is an exciting milestone, and we thank you for becoming part of <strong>Valmo’s franchise network</strong>.</p>

          <div style="margin: 25px 0; padding: 20px; background-color: #fff8e5; border-left: 4px solid #ffaa00; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #cc7a00;">📎 What’s Next?</h3>
            <p>The next step is to complete the <strong>Agreement Fee</strong> payment of <strong>₹90,100</strong>.</p>
            <p>This amount is <strong>fully refundable within 90 days</strong> in case of withdrawal or non-activation.</p>
            <p>A separate email will follow shortly with full payment details and a secure payment link.</p>
          </div>

          <p>If you have any questions or need help, feel free to call me directly at <strong>${paymentDetails.employeeMobile}</strong> or reply to this email.</p>

          <p style="margin-top: 30px;">Looking forward to working with you and welcoming you onboard!</p>

          <p style="margin-top: 30px;">
            Best Regards,<br/>
            <strong>${paymentDetails.name}</strong><br/>
            Business Development Team<br/>
            📧 hello@valmodelivery.com<br/>
            📞 ${paymentDetails.mobile}<br/>
            🌐 <a href="https://www.valmodelivery.com" style="color: #3366cc;">www.valmodelivery.com</a>
          </p>

          <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;" />

          <p style="font-size: 12px; color: #999;">
            <strong>Email Disclaimer:</strong><br/>
            This email and any attachments are confidential and intended solely for the use of the individual to whom it is addressed.
            If you are not the intended recipient, please notify the sender and delete this email. Unauthorized use, disclosure, or copying is strictly prohibited.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log("✨ Stylish payment confirmation email sent to", user.email);
};



app.get('/agreementReminderMail/:id/:mangerId', async (req, res) => {
  try {
    const leads = await personalMailedForm.findById(req.params.id)
    leads.agreementNote = "Approved"
    await leads.save()
    const m = await User.findOne({ unique_code: req.params.mangerId })
    console.log(leads, m)
    agreementReminderMail(leads, m)
    res.json(leads);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
})
app.get('/api/personal-application/:id', async (req, res) => {
  try {
    const leads = await personalMailedForm.findById(req.params.id)

    res.json(leads);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
})


 
const agreementReminderMail = async (user, details) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "hello@valmodelivery.com",
      pass: "Sanjay@9523"
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  });

  const mailOptions = {
    from: '"Valmo Logistics" <hello@valmodelivery.com>',
    to: user.email,
    subject: '📝 Agreement Fee Payment Request – Valmo Franchise Onboarding',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 30px;">
        <div style="max-width: 650px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.06);">
        

          <p style="font-size: 18px;">Dear <strong>${user.fullName}</strong>,</p>

          <p>I hope this message finds you well.</p>

          <p>Thank you once again for showing interest in partnering with <strong style="color: #2d6cdf;">Valmo Logistics</strong> as a Franchise Partner. We’re excited to move forward with your application for the PIN Code <strong>${user.officePinCode} – ${user.officeAddress}</strong>.</p>

          <div style="background-color: #eef5ff; border-left: 4px solid #2d6cdf; padding: 20px; margin: 25px 0; border-radius: 8px;">
            <h3 style="margin-top: 0;">📝 Agreement Fee Payment – ₹90,100 (Refundable)</h3>
            <p>Please proceed with the payment of ₹90,100 to confirm your franchise registration and lock your selected PIN code.</p>
          </div>

          <p><strong>✅ Note:</strong><br/>This amount is fully refundable within 90 days if the franchise doesn’t proceed or you choose to withdraw (as per company terms & conditions).</p>

          <h3 style="margin-top: 30px; color: #2d6cdf;">📌 Purpose of the Agreement Fee</h3>
          <ul>
            <li>Franchise documentation & legal setup</li>
            <li>Partner onboarding & PIN code reservation</li>
            <li>System and training access</li>
            <li>Operational readiness & brand authorization</li>
          </ul>

          <h3 style="margin-top: 30px; color: #2d6cdf;">💸 Payment Details</h3>
          <p><strong>Amount:</strong> ₹90,100</p>
          <p><strong>Payment Portal:</strong> 👉 <a href="https://valmodelivery.com/check-status/" style="color: #2d6cdf; text-decoration: underline;">Pay Now via Customer Portal</a></p>
          <p><strong>Reference:</strong> Please mention your name and PIN code in remarks<br/>
          <em>(e.g., “${user.fullName}-${user.officePinCode}”)</em></p>

          <h3 style="margin-top: 30px; color: #2d6cdf;">🔐 Refund Guarantee</h3>
          <p>Your investment is safe. If the partnership doesn’t continue, your fee is <strong>100% refundable</strong> within 90 working days from your cancellation request.</p>

          <h3 style="margin-top: 30px; color: #2d6cdf;">🚀 Next Steps After Payment</h3>
          <ul>
            <li>You’ll receive your official franchise agreement for e-signing.</li>
            <li>Our team will initiate location verification & onboarding.</li>
            <li>You’ll gain access to our franchise toolkit and training.</li>
          </ul>

          <p>If you have any questions, feel free to call me at <strong>${details.mobile}</strong> or just reply to this email.</p>

          <p style="margin-top: 30px;">We’re truly excited to welcome you to the <strong>Valmo family</strong> and build a strong partnership together!</p>

          <p style="margin-top: 30px;">
            Best Regards,<br/>
            <strong>${details.name}</strong><br/>
            Business Development Team<br/>
            📧 hello@valmodelivery.com<br/>
            📞 ${details.mobile}<br/>
            🌐 <a href="https://www.valmodelivery.com" style="color: #2d6cdf;">www.valmodelivery.com</a>
          </p>

          <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;" />

          <p style="font-size: 12px; color: #777;">
            <strong>Email Disclaimer:</strong><br/>
            This message is confidential and intended only for the recipient named above. If you are not the intended recipient, please notify the sender immediately and delete this email. Unauthorized use, distribution, or copying is prohibited.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log("📩 Agreement Fee Request email sent to", user.email);
};


















// Bank QR Schema
const bankQRSchema = new mongoose.Schema({
  remarks: String,
  qr_code: String,
  createdAt: { type: Date, default: Date.now }
});

const BankQR = mongoose.model('BankQR', bankQRSchema);

// Configure Multer for file uploads
const stozzrage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'qr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadsss = multer({
  storage: stozzrage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create a new bank QR entry
app.post('/api/banks', uploadsss.single('qr_code'), async (req, res) => {
  try {
    const { remarks } = req.body;

    const bankQRData = { remarks };
    if (req.file) {
      bankQRData.qr_code = `${req.file.filename}`;
    }

    const newBankQR = new BankQR(bankQRData);
    await newBankQR.save();

    res.status(201).json(newBankQR);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all bank QR entries
app.get('/api/banks', async (req, res) => {
  try {
    const banks = await BankQR.find().sort({ createdAt: -1 });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a bank QR entry
app.put('/api/banks/:id', upload.single('qr_code'), async (req, res) => {
  try {
    const bankQR = await BankQR.findById(req.params.id);
    if (!bankQR) {
      return res.status(404).json({ message: 'Bank QR not found' });
    }

    bankQR.remarks = req.body.remarks;

    // If new QR code is uploaded
    if (req.file) {
      // Delete old QR code file if exists
      if (bankQR.qr_code) {
        const oldFilePath = path.join(__dirname, bankQR.qr_code);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      bankQR.qr_code = `/uploads/${req.file.filename}`;
    }

    await bankQR.save();
    res.json(bankQR);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a bank QR entry
app.delete('/api/banks/:id', async (req, res) => {
  try {
    const bankQR = await BankQR.findByIdAndDelete(req.params.id);
    if (!bankQR) {
      return res.status(404).json({ message: 'Bank QR not found' });
    }

    // Delete associated QR code file if exists
    if (bankQR.qr_code) {
      const filePath = path.join(__dirname, bankQR.qr_code);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Bank QR deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.delete('/api/banksAiign/:id/:managerId', async (req, res) => {
  try {
    const bankQR = await BankQR.findById(req.params.id);
    const personal = await personalMailedForm.findById(req.params.managerId);
    if (!bankQR) {
      return res.status(404).json({ message: 'Bank QR not found' });
    }

    personal.bankRemark = bankQR.remarks,
      personal.bankQr = bankQR.qr_code,

      await personal.save()

    res.json({ message: 'Bank QR Assigned successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});












app.get('/personalmailblocked/:id', async (req, res) => {
  try {
    const lead = await personalMailedForm.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Toggle the isBlocked value
    lead.isBlocked = !lead.isBlocked;

    // Save the updated lead
    await lead.save();

    console.log(`User ${lead._id} is now ${lead.isBlocked ? 'blocked' : 'unblocked'}`);
    res.json({ message: `User ${lead.isBlocked ? 'blocked' : 'unblocked'} successfully`, lead });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user block status', error });
  }
});

app.get('/usersFromManager/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by unique_code
    const user = await User.findOne({ unique_code: id });

    // If no user is found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch all leads associated with the proposalList IDs
    const leads = await proposal.find({ _id: { $in: user.proposalList } });

    // Return the fetched leads
    res.json({ leads, user });
  } catch (error) {
    console.error('Error retrieving leads:', error);
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
});














app.get('/proposals', async (req, res) => {
  try {
    const leads = await proposal.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
})
app.get('/getfranch', async (req, res) => {
  try {
    // Assuming `created_at` is the field that stores the timestamp of insertion
    const lastBank = await Franchise.find().sort({ created_at: 1 });

    if (!lastBank) {
      return res.status(404).json({ message: 'No banks found' });
    }

    res.json(lastBank);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving last added bank', error });
  }
});
// app.get('/bank', async (req, res) => {
//   try {
//     // Assuming `created_at` is the field that stores the timestamp of insertion
//     const lastBank = await bank.findOne().sort({ created_at: 1 });

//     if (!lastBank) {
//       return res.status(404).json({ message: 'No banks found' });
//     }

//     res.json(lastBank);
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving last added bank', error });
//   }
// });
// app.get('/Allbank', async (req, res) => {
//   try {
//     // Assuming `created_at` is the field that stores the timestamp of insertion
//     const lastBank = await bank.find({ created_at: -1 });

//     if (!lastBank) {
//       return res.status(404).json({ message: 'No banks found' });
//     }

//     res.json(lastBank);
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving last added bank', error });
//   }
// });













app.get('/bank', async (req, res) => {
  try {
    const lastBank = await bank.findOne().sort({ created_at: -1 });  // Fix sorting to get the last bank added
    if (!lastBank) {
      return res.status(404).json({ message: 'No banks found' });
    }
    res.json(lastBank);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving last added bank', error });
  }
});
// app.get('/assignedBankOfUser/:userId', async (req, res) => {
//   try {
//     const lead= await Lead.findById( req.params.userId)
//     const lastBank = await bank.findById(lead.AssignedBank)  // Fix sorting to get the last bank added
//     if (!lastBank) {
//       return res.status(404).json({ message: 'No banks found' });
//     }
//     res.json(lastBank);
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ message: 'Error retrieving last added bank', error });
//   }
// });




app.get('/assignedBankOfUser/:userId', async (req, res) => {
  try {
    let userId = req.params.userId;
    userId = userId.replace(/[^a-fA-F0-9]/g, '');
    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {

      return res.status(400).json({ message: 'Invalid userId format' });
    }

    // Find the Lead by userId
    const lead = await Lead.findById(userId);
    if (!lead) {

      return res.status(404).json({ message: 'Lead not found' });
    }
    console.log(lead)
    // Find the last assigned bank based on the AssignedBank field in Lead
    const lastBank = await bank.findById(lead.AssignedBank);
    if (!lastBank) {
      console.log("userId", userId)
      return res.status(404).json({ message: 'No assigned bank found for this lead' });
    }

    res.json(lastBank);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error retrieving last assigned bank', error });
  }
});












app.get('/Allbank', async (req, res) => {
  try {
    const allBanks = await bank.find().sort({ created_at: -1 }); // Fetch all banks and sort by created_at
    if (!allBanks) {
      return res.status(404).json({ message: 'No banks found' });
    }
    res.json(allBanks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving banks', error });
  }
});

// Update a bank by ID
app.put('/update-bank/:id', async (req, res) => {
  try {
    const updatedBank = await bank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBank) {
      return res.status(404).json({ message: 'Bank not found' });
    }
    res.json(updatedBank);
  } catch (error) {
    res.status(500).json({ message: 'Error updating bank', error });
  }
});

// Delete a bank by ID
app.delete('/delete-bank/:id', async (req, res) => {
  try {
    const deletedBank = await bank.findByIdAndDelete(req.params.id);
    if (!deletedBank) {
      return res.status(404).json({ message: 'Bank not found' });
    }
    res.json({ message: 'Bank deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bank', error });
  }
});
app.get('/assignBnk/:bankId/:userId', async (req, res) => {
  console.log(req.params)
  try {
    const deletedBank = await Lead.findByIdAndUpdate(req.params.userId, {
      AssignedBank: req.params.bankId
    }, { new: true });
    console.log(deletedBank)
    if (!deletedBank) {
      return res.status(404).json({ message: 'Bank not found' });
    }
    res.json({ message: 'Bank Assigned successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error deleting bank', error });
  }
});






















// Fetch User by ID
app.get('/user/:id', async (req, res) => {
  try {

    const user = await Lead.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.get('/userFromPDF/:id', async (req, res) => {
  try {
    const user = await Lead.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the last added bank (assuming 'createdAt' field exists)
    const bankData = await bank.findOne().sort({ createdAt: -1 });

    if (!bankData) return res.status(404).json({ message: 'Bank details not found' });

    res.json({ ...user.toObject(), ...bankData.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.get('/user/block/:id', async (req, res) => {
  try {
    const user = await Lead.findByIdAndUpdate(req.params.id, {
      block: true
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.get('/user/deleteButton/:id', async (req, res) => {
  try {
    const user = await Lead.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.get('/manager/:id', async (req, res) => {
  try {
    console.log("sdsd")
    const user = await User.findOne({ unique_code: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.log("sdsdd")
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.get('/user/followProposal/:id/:num', async (req, res) => {
  const num = parseInt(req.params.num); // Convert num to an integer
  const updateData = {};
  console.log(num)
  if (num === 1) {
    updateData.follow1 = true;
  } else if (num === 2) {
    updateData.follow2 = true;
  } else if (num === 3) {
    updateData.follow3 = true;
  } else {
    return res.status(400).json({ message: 'Invalid follow number' });
  }

  try {
    const db = await proposal.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!db) return res.status(404).json({ message: 'User not found' });

    res.json(db);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user data', error });
  }
});
app.get('/user/followLead/:id/:num', async (req, res) => {
  const num = parseInt(req.params.num); // Convert num to an integer
  const updateData = {};
  console.log(num)
  if (num === 1) {
    updateData.follow1 = true;
  } else if (num === 2) {
    updateData.follow2 = true;
  } else if (num === 3) {
    updateData.follow3 = true;
  } else {
    return res.status(400).json({ message: 'Invalid follow number' });
  }

  try {
    const db = await Lead.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!db) return res.status(404).json({ message: 'User not found' });

    res.json(db);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user data', error });
  }
});





app.delete('/proposals/:id', async (req, res) => {
  try {
    const user = await proposal.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.get('/user/step1WelcomeMAil/:id/:manager', async (req, res) => {
  try {
    const user = await Lead.findById(req.params.id);
    const manager = await User.findOne({ unique_code: req.params.manager });
    console.log("manager")
    if (!user) return res.status(404).json({ message: 'User not found' });
    await sendMail(user, manager)
    res.json(user);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});

app.get('/user/step2WelcomeMAil/:id', async (req, res) => {

  try {
    const user = await Lead.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await send2Mail(user);
    res.json(user);
  } catch (error) {

    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.get('/user/login/:doc/:mobile', async (req, res) => {
  console.log(req.params)
  try {
    const user = await Lead.findOne({ documentNumber: req.params.doc });
    const udser = await Lead.find();
    console.log(user)
    console.log(udser)
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {

    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.post("/userm/login", async (req, res) => {
  const { unique_code } = req.body;

  if (!unique_code) {
    return res.status(400).json({ message: "Unique code is required" });
  }

  // Check if the user exists in the database
  const user = await User.findOne({ unique_code });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  return res.status(200).json({ message: "Login successful", role: "user" });
});
app.post('/create-proposal', async (req, res) => {
  try {
    //  console.log(req.body)
    const newLead = new proposal(req.body);
    await newLead.save();
    await sendProposalMail(req.body);

    res.json({ message: 'New Proposal created successfully!' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.post('/create-proposal/:id', async (req, res) => {
  try {
    const userDetails = await User.findOne({ unique_code: req.params.id });
    //  console.log(req.body)
    const newLead = new proposal(req.body);
    const latestLead = await newLead.save();
    userDetails.proposalList.push(latestLead._id);
    await userDetails.save();
    await sendProposalMailFromUser(req.body, userDetails);
    res.json({ message: 'New Proposal created successfully!' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
let lastAssignedUserIndex = 0; // Global variable to keep track of last assigned user

app.post('/create-proposal-by-web', async (req, res) => {
  try {
    // Fetch all unblocked users
    const unblockedUsers = await User.find({ block: false });

    if (unblockedUsers.length === 0) {
      return res.status(400).json({ message: 'No unblocked users available' });
    }

    // Round-robin distribution
    const assignedUser = unblockedUsers[lastAssignedUserIndex];

    // Update the index for the next lead
    lastAssignedUserIndex = (lastAssignedUserIndex + 1) % unblockedUsers.length;

    // Create a new proposal
    const newLead = new proposal(req.body);
    const latestLead = await newLead.save();

    // Assign the proposal to the selected user
    assignedUser.proposalList.push(latestLead._id);
    await assignedUser.save();

    // Send email notification
    await sendProposalMailFromUser(req.body, assignedUser);

    res.json({ message: 'New Proposal created successfully!', whatsappNumer: assignedUser.mobile });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating proposal', error });
  }
});

app.post('/user/contactus', async (req, res) => {
  try {

    await sendMailToEmail(req.body);
    res.json({ message: 'Create proposal' });
  } catch (error) {

    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
const sendMailToEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    host: "mail.valmodelivery.com",
    port: 465, // Secure SSL/TLS SMTP Port
    secure: true, // SSL/TLS
    auth: {
      user: "hello@valmodelivery.com",
      pass: "Sanjay@9523" // Replace with actual email password
    }
  });

  const mailOptions = {
    from: '"Valmo Logistics" <hello@valmodelivery.com>',
    to: "usercontact@valmodelivery.com",
    subject: "New User Contacted Via Contact Us Form",
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone}</p>
      <p><strong>Message:</strong></p>
      <p>${user.message}</p>
      <br>
      <p>Sent from valmodelivery.com</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to", user.email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
// const sendMail = async (user) => {
//   const transporter = nodemailer.createTransport({
//     host: "mail.valmodelivery.com",
//     port: 465, // Secure SSL/TLS SMTP Port
//     secure: true, // SSL/TLS
//     auth: {
//       user: "hello@valmodelivery.com",
//       pass: "Sanjay@9523" // Replace with actual email password
//     }
//   });

//   const mailOptions = {
//     from: '"Valmo Logistics" <hello@valmodelivery.com>',
//     to: user.email,
//     subject: "Your Application Has Been Approved – Partnership Opportunity with Valmo Logistics",
//     html: `
//           <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
//               <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
//                   <h2 style="text-align: center; color: #333;">Greetings from Valmo!</h2>
//                   <p>Dear <strong>${user.username}</strong>,</p>
//                   <p>We are India's most reliable and cost-effective logistics service provider, committed to streamlining the delivery process.</p>

//                   <h3>Why Partner with Valmo?</h3>
//                   <ul>
//                       <li>✔ 9+ lakh orders shipped per day</li>
//                       <li>✔ 30,000+ delivery executives</li>
//                       <li>✔ 3,000+ partners</li>
//                       <li>✔ 6,000+ PIN codes covered</li>
//                   </ul>

//                   <h3>Franchise Opportunities</h3>
//                   <p>We invite you to join us as a Delivery Partner or District Franchisee:</p>
//                   <ul>
//                       <li>✅ Profit Margin: 25-30% of total revenue</li>
//                       <li>✅ Annual Profit Potential: ₹10-15 lakh per annum</li>
//                   </ul>

//                   <h3>Application Details</h3>
//                   <p><strong>Application No.:</strong> ${user.applicationNumber}</p>
//                   <p><strong>Application Status:</strong> Approved</p>

//  <ul><strong>Allocated Location:</strong> 
//         ${
//           user.selectedPostOfficeList.map((post_office) => `<li>${post_office}</li>`)
//         }

//         </ul>
//                   <h3>Recipient Details</h3>
//                   <p><strong>Name:</strong> ${user.username}</p>
//                   <p><strong>Address:</strong> ${user.address}</p>
//                   <p><strong>Mobile No.:</strong> ${user.mobile}</p>
//                   <p><strong>Email ID:</strong> ${user.email}</p>

//                   <h3>Login Details</h3>
//                   <p><strong>Login ID/Document No.:</strong> ${user.documentNumber}</p>
//                   <p><strong>Password:</strong> ${user.mobile}</p>


//                   <p>Login : <a href="https://www.valmodelivery.com/status.html" style="color: blue;">https://www.valmodelivery.com/status.html</a></p>




//  <p>Best regards,<br>
//       Rajiv singh<br>
//       Business Development Team<br>
//       Valmo Logistics<br>
//       📧 <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a><br>
//       📞 +917004455359</p>






//               </div>
//           </div>
//       `
//   };

//   await transporter.sendMail(mailOptions);
//   console.log("Email sent successfully to", user.email);
// };

const sendMail = async (user, manager) => {
  const transporter = nodemailer.createTransport({
    host: "s3484.bom1.stableserver.net",
    port: 465, // Secure SSL/TLS SMTP Port
    secure: true, // SSL/TLS
    auth: {
      user: "hello@valmodelivery.com",
      pass: "Sanjay@9523" // Replace with actual email password
    },
  });

  const mailOptions = {
    from: '"Valmo Logistics" <hello@valmodelivery.com>',
    to: user.email,
    subject: "Your Application Has Been Approved – Partnership Opportunity with Valmo Logistics",
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; padding: 20px; background:rgb(237, 237, 237); color: #ffffff;">
        <div style="max-width: 600px; margin: auto; background:rgb(74, 74, 74); padding: 30px; border-radius: 15px; border: 1px solid #333; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
          <h2 style="text-align: center; color: #ffd700; font-size: 28px; margin-bottom: 20px;">🎉 Greetings from Valmo!</h2>
          <p style="font-size: 16px; line-height: 1.6;">Dear <strong style="color: #ffd700;">${user.username}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">We are India's most reliable and cost-effective logistics service provider, committed to streamlining the delivery process.</p>
          <h3 style="color: #ffd700; font-size: 22px; margin-top: 25px;">🌟 Why Partner with Valmo?</h3>
          <ul style="list-style: none; padding: 0;">
                 
            <li style="margin-bottom: 10px; font-size: 16px;">✔️ 9+ lakh orders shipped per day</li>
            <li style="margin-bottom: 10px; font-size: 16px;">✔️ 30,000+ delivery executives</li>
            <li style="margin-bottom: 10px; font-size: 16px;">✔️ 3,000+ partners</li>
            <li style="margin-bottom: 10px; font-size: 16px;">✔️ 6,000+ PIN codes covered</li>
           
          </ul>       
          <h3 style="color: #ffd700; font-size: 22px; margin-top: 25px;">💼 Franchise Opportunities</h3>
          <p style="font-size: 16px; line-height: 1.6;">We invite you to join us as a Delivery Partner or District Franchisee:</p>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px; font-size: 16px;">✅ Profit Margin: 25-30% of total revenue</li>
            <li style="margin-bottom: 10px; font-size: 16px;">✅ Annual Profit Potential: ₹10-15 lakh per annum</li>
          </ul>
          <h3 style="color: #ffd700; font-size: 22px; margin-top: 25px;">📄 Application Details</h3>
          <p style="font-size: 16px;"><strong>Application No.:</strong> ${user.applicationNumber}</p>
          <p style="font-size: 16px;"><strong>Application Status:</strong> Approved</p>
          <p style="font-size: 16px;"><strong>Allocated Location:</strong></p>
        <ul><strong>Allocated Location:</strong> 
  ${user.pincodes.map((name) => `
    <li>
      <strong>${name.district} ${name.state} ${name.pincode
      },</strong>
      <ul>
        ${name.selectedPostOffices.map((office) => `<li>${office}</li>`).join('')}
      </ul>
    </li>
  `).join('')}
</ul>
          <h3 style="color: #ffd700; font-size: 22px; margin-top: 25px;">👤 Recipient Details</h3>
          <p style="font-size: 16px;"><strong>Name:</strong> ${user.username}</p>
          <p style="font-size: 16px;"><strong>Address:</strong> ${user.address}</p>
          <p style="font-size: 16px;"><strong>Mobile No.:</strong> ${user.mobile}</p>
          <p style="font-size: 16px;"><strong>Email ID:</strong> ${user.email}</p>

          <h3 style="color: #ffd700; font-size: 22px; margin-top: 25px;">🔑 Login Details</h3>
          <div style="background: #333; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 16px;"><strong>Login ID/Document No.:</strong> 
           <input 
      type="text" 
      value="${user.documentNumber}" 
      readonly 
      style="width: 100%; padding: 8px; border: none; border-radius: 5px; color: #333; background: #ffd700; margin-top: 5px;"
      onclick="this.select()"
    />
            </p>
            <p style="font-size: 16px;"><strong>Password:</strong> 
<input 
      type="text" 
      value="${user.mobile}" 
      readonly 
      style="width: 100%; padding: 8px; border: none; border-radius: 5px; color: #333; background: #ffd700; margin-top: 5px;"
      onclick="this.select()"
    />            </p>
          </div>
  
          <p style="font-size: 16px; text-align: center;">
            <a href="https://www.valmodelivery.com/status.html" style="color: #ffd700; text-decoration: none; font-weight: bold;">👉 Click here to Login</a>
          </p>
          <p style="font-size: 16px; text-align: center; margin-top: 30px;">
            Best regards,<br>
            <strong> ${manager.name} </strong><br>
            Business Development Team<br>
            Valmo Logistics<br>
            📧 <a href="mailto:hello@valmodelivery.com" style="color: #ffd700;">hello@valmodelivery.com</a><br>
            📞 ${manager.mobile}
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully to", user.email);
};



const send2Mail = async (user) => {

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465, // Secure SSL/TLS SMTP Port
    secure: true, // SSL/TLS
    auth: {
      user: "hello@valmodelivery.com",
      pass: "Sanjay@9523" // Replace with actual email password
    }
  });

  const mailOptions = {
    from: '"Valmo Logistics" <hello@valmodelivery.com>',
    to: user.email,
    subject: "Your Application Has Been Approved – Partnership Opportunity with Valmo Logistics",
    html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
              <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
                  <h2 style="text-align: center; color: #333;">Greetings from Valmo!</h2>
                  <p>Dear <strong>${user.fullName}</strong>,</p>
                  <p>We are India's most reliable and cost-effective logistics service provider, committed to streamlining the delivery process.</p>

                  <h3>Why Partner with Valmo?</h3>
                  <ul>
                      <li>✔ 9+ lakh orders shipped per day</li>
                      <li>✔ 30,000+ delivery executives</li>
                      <li>✔ 3,000+ partners</li>
                      <li>✔ 6,000+ PIN codes covered</li>
                  </ul>

                  <h3>Franchise Opportunities</h3>
                  <p>We invite you to join us as a Delivery Partner or District Franchisee:</p>
                  <ul>
                      <li>✅ Profit Margin: 25-30% of total revenue</li>
                      <li>✅ Annual Profit Potential: ₹10-15 lakh per annum</li>
                  </ul>

                  <h3>Application Details</h3>
                  <p><strong>Application No.:</strong> ${user.applicationNumber}</p>
                  <p><strong>Application Status:</strong> Approved</p>
                  
<ul><strong>Allocated Location:</strong> 
  
    <li>
      <strong>${user.resDistrict} ${user.resState} ${user.resPinCode
      },</strong>
      
    </li>
  
</ul>

                  <h3>Recipient Details</h3>
                  <p><strong>Name:</strong> ${user.fullName}</p>
                  <p><strong>Address:</strong> ${user.houseStreet}</p>
                  <p><strong>Mobile No.:</strong> ${user.mobileNumber}</p>
                  <p><strong>Email ID:</strong> ${user.email}</p>
                  <h3>Login Details</h3>
                  <p><strong>Login ID/Document No.:</strong> ${user.applicationNumber}</p>
                  <p><strong>Password:</strong> ${user.mobile}</p>
                  <p>For more details, visit our website:</p>
                  <p><a href="https://www.valmodelivery.com" style="color: blue;">www.valmodelivery.com</a></p>
                  <p style="text-align: center; font-weight: bold;">Best Regards, <br> Valmo Logistics Franchisee Development Team</p>
              </div>
          </div>
      `
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully to", user.email);
};
const sendProposalMail = async (user) => {
  const transporter = nodemailer.createTransport({
    host: "mail.valmodelivery.com",
    port: 465, // Secure SSL/TLS SMTP Port
    secure: true, // SSL/TLS
    auth: {
      user: "hello@valmodelivery.com",
      pass: "Sanjay@9523" // Replace with actual email password
    }
  });

  const mailOptions = {
    from: '"Valmo Logistics" <hello@valmodelivery.com>',
    to: user.email,
    subject: "Proposal for Valmo Logistics Partnership – Preferred Location and PIN Code Availability",
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #1E88E5;">Dear ${user.name},</h2>
      <p>Greetings from Valmo!</p>
      <p>We are India’s most reliable and cost-effective logistics service partner, committed to streamlining logistics and ensuring a smooth and efficient delivery experience at the lowest cost.</p>
      <p>We are pleased to inform you that your preferred PIN code and location are available for a Valmo franchise partnership. This is a great opportunity to collaborate with one of India's fastest-growing logistics companies.</p>

      <h3 style="color: #1E88E5;">Why Partner with Valmo?</h3>
      <ul style="list-style-type: none; padding-left: 0;">
        <li>9+ lakh orders shipped daily</li>
        <li>30,000+ delivery executives</li>
        <li>3,000+ partners</li>
        <li>6,000+ PIN codes served</li>
      </ul>

      <h3 style="color: #1E88E5;">Preferred Location & PIN Code Availability:</h3>
      <p><strong>PIN Code Availability:</strong> ${user.pincode}</p>
      <p><strong>Location Availability:</strong></p>
      <ul>
        ${user.post_offices.map((post_office) => `<li>${post_office}</li>`).join("")}
      </ul>

      <h3 style="color: #1E88E5;">Franchise Opportunities & Earnings</h3>
      <p><strong>Delivery Franchise:</strong> ₹30 per Shipment (300 products daily commitment)</p>
       
      <p><strong>Profit Margin:</strong> 25-30%</p>
      <p><strong>Annual Profit Potential:</strong> ₹10-15 lakh per annum</p>

      <h3 style="color: #1E88E5;">Company Support Includes:</h3>
      <ul>
        <li>Comprehensive training for franchise owners & staff</li>
        <li>Advanced software & order tracking tools</li>
        <li>Barcode scanner, fingerprint scanner</li>
        <li>Marketing materials (banners, posters, etc.)</li>
        <li>Doorstep stock delivery</li>
        <li>Vehicles for shipment & delivery</li>
        <li>Loading & unloading support</li>
      </ul>

      <h3 style="color: #1E88E5;">Company Benefits for Franchise Partners:</h3>
      <ul>
        <li>Company pays salary for 3 employees</li>
        <li>50% rent & electricity bill covered</li>
        <li>Company-designed interiors</li>
        <li>All necessary products & equipment provided</li>
        <li>Space requirement: 200-500 sq. ft.</li>
      </ul>

      <h3 style="color: #1E88E5;">Investment & Financial Information</h3>
      <p><strong>Registration Fee:</strong> ₹18,600</p>
      <p><strong>Security Money:</strong> 90% refundable after the agreement</p>
      <p><strong>Interest Earned on Security Deposit:</strong> 7.5% annually</p>
      <p><strong>Interest Calculation Example:</strong> ₹2,00,000 × 7.5% × 1 year = ₹15,000 per annum</p>
      <p><strong>One-time Setup Fee:</strong> ₹2,00,000 (lifetime investment)</p>
      <p><strong>Agreement Fee:</strong> ₹90,100 (fully refundable)</p>
      <p><strong>Total Payment:</strong> ₹3,08,700 (refundable except for registration fee)</p>

      <h3 style="color: #1E88E5;">Required Documents:</h3>
      <ul>
        <li>Aadhar card/Voter ID Card</li>
        <li>PAN Card</li>
        <li>Bank Account Details</li>
        <li>Location images & details</li>
        <li>One passport-size photograph</li>
      </ul>

      <p>We believe this partnership will be mutually beneficial, and we are excited about the possibility of collaborating with you.</p>

      <h3 style="color: #1E88E5;">To Proceed with This Opportunity:</h3>
      <ol>
        <li>Kindly fill out the attached application form.</li>
        <li>Please also attach the necessary documents mentioned above and send them back to us via email at <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a>.</li>
      </ol>

      <p>Additionally, I have attached Valmo Franchisee Prospects for your reference. These documents will provide you with further insights into our business and partnership details.</p>

      <p>Our Business Development Team is available for any questions or additional information you may need. You can also reach us at:</p>
      <ul>
        <li>📧 <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a></li>
        <li>📞 +917004455359 </li>
        <li>🌐 <a href="http://www.valmodelivery.com">www.valmodelivery.com</a></li>
      </ul>

      <p><strong>Office Address:</strong><br>
      3rd Floor, Wing-E, Helios Business Park, Kadubeesanahalli Village, Varthur Hobli, Outer Ring Road, Bellandur, Bangalore South, Karnataka, India, 560103</p>

      <p>We look forward to your response and the opportunity to collaborate.</p>

      <p>Best regards,<br>
      Rajiv singh<br>
      Business Development Team<br>
      Valmo Logistics<br>
      📧 <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a><br>
      📞 +917004455359</p>

      <p style="font-size: 12px; color: #888; margin-top: 20px;">
        <strong>Disclaimer:</strong><br>
        This email and its attachments are intended for the recipient(s) named above and may contain confidential or privileged information. If you are not the intended recipient, please notify the sender immediately by replying to this email and deleting it from your system. Any unauthorized use, disclosure, or distribution of this communication is prohibited. Valmo Logistics does not accept any responsibility for any loss or damage caused by the use of this email or its attachments.
      </p>
    </div>
  `,

    attachments: [
      {
        filename: "Valmo Application Form.pdf",
        path: path.join(__dirname, "Valmo Application Form_compressed.pdf") // Ensure this file exists
      },
      {
        filename: "Valmo Franchise Prospectus.pdf",
        path: path.join(__dirname, "Valmo Franchise Prospectus_compressed.pdf") // Ensure this file exists
      }
    ]
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully to", user.email);
};
// const sendProposalMailFromUser = async (user, manager) => {
//   const transporter = nodemailer.createTransport({
//     host: "s3484.bom1.stableserver.net",
//     port: 465, // Secure SSL/TLS SMTP Port
//     secure: true, // SSL/TLS
//     auth: {
//       user: "hello@valmodelivery.com",
//       pass: "Sanjay@9523" // Replace with actual email password
//     },

//   });

//   const mailOptions = {
//     from: '"Valmo Logistics" <hello@valmodelivery.com>',
//     to: user.email,
//     subject: "Proposal for Valmo Logistics Partnership – Preferred Location and PIN Code Availability",
//     html: `
//       <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 800px; margin: 0 auto;">
//         <h2 style="color: #1E88E5;">Dear ${user.name},</h2>
//         <p>Greetings from Valmo!</p>
//         <p>We are India’s most reliable and cost-effective logistics service partner, committed to streamlining logistics and ensuring a smooth and efficient delivery experience at the lowest cost.</p>
//         <p>We are pleased to inform you that your preferred PIN code and location are available for a Valmo franchise partnership. This is a great opportunity to collaborate with one of India's fastest-growing logistics companies.</p>

//         <h3 style="color: #1E88E5;">Why Partner with Valmo?</h3>
//         <ul style="list-style-type: none; padding-left: 0;">
//           <li>9+ lakh orders shipped daily</li>
//           <li>30,000+ delivery executives</li>
//           <li>3,000+ partners</li>
//           <li>6,000+ PIN codes served</li>
//         </ul>

//         ${user.pincodes.map((details, idx) => ` <div> <h3 style="color: #1E88E5;">Preferred Location & PIN Code Availability ${idx + 1} :</h3>
//       <p><strong>PIN Code Availability:</strong> ${details.pincode}</p>
//       <p><strong>Location Availability:</strong></p>
//       <ul>
//         ${details.post_offices.map((post_office) => `<li>${post_office}</li>`).join("")}
//       </ul> </div>`)}

//         <h3 style="color: #1E88E5;">Franchise Opportunities & Earnings</h3>
//         <p><strong>Delivery Franchise:</strong> ₹30 per Shipment (300 products daily commitment)</p>

//         <p><strong>Profit Margin:</strong> 25-30%</p>
//         <p><strong>Annual Profit Potential:</strong> ₹10-15 lakh per annum</p>

//         <h3 style="color: #1E88E5;">Company Support Includes:</h3>
//         <ul>
//           <li>Comprehensive training for franchise owners & staff</li>
//           <li>Advanced software & order tracking tools</li>
//           <li>Barcode scanner, fingerprint scanner</li>
//           <li>Marketing materials (banners, posters, etc.)</li>
//           <li>Doorstep stock delivery</li>
//           <li>Vehicles for shipment & delivery</li>
//           <li>Loading & unloading support</li>
//         </ul>

//         <h3 style="color: #1E88E5;">Company Benefits for Franchise Partners:</h3>
//         <ul>
//           <li>Company pays salary for 3 employees</li>
//           <li>50% rent & electricity bill covered</li>
//           <li>Company-designed interiors</li>
//           <li>All necessary products & equipment provided</li>
//           <li>Space requirement: 200-500 sq. ft.</li>
//         </ul>

//         <h3 style="color: #1E88E5;">Investment & Financial Information</h3>
//         <p><strong>Registration Fee:</strong> ₹18600 </p>
//         <p><strong>Security Money:</strong> 90% refundable after the agreement</p>
//         <p><strong>Interest Earned on Security Deposit:</strong> 7.5% annually</p>
//         <p><strong>Interest Calculation Example:</strong> ₹2,00,000 × 7.5% × 1 year = ₹15,000 per annum</p>
//         <p><strong>One-time Setup Fee:</strong> ₹2,00,000 (lifetime investment)</p>
//         <p><strong>Agreement Fee:</strong> ₹90,100 (fully refundable)</p>
//         <p><strong>Total Payment:</strong> ₹3,08,700 (refundable except for registration fee)</p>

//         <h3 style="color: #1E88E5;">Required Documents:</h3>
//         <ul>
//           <li>Aadhar card/Voter ID Card</li>
//           <li>PAN Card</li>
//           <li>Bank Account Details</li>
//           <li>Location images & details</li>
//           <li>One passport-size photograph</li>
//         </ul>

//         <p>We believe this partnership will be mutually beneficial, and we are excited about the possibility of collaborating with you.</p>

//         <h3 style="color: #1E88E5;">To Proceed with This Opportunity:</h3>
//         <ol>
//           <li>Kindly fill out the attached application form.</li>
//           <li>Please also attach the necessary documents mentioned above and send them back to us via email at <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a>.</li>
//         </ol>

//         <p>Additionally, I have attached Valmo Franchisee Prospects for your reference. These documents will provide you with further insights into our business and partnership details.</p>

//         <p>Our Business Development Team is available for any questions or additional information you may need. You can also reach us at:</p>
//         <ul>
//           <li>📧 <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a></li>
//           <li>📞 ${manager.mobile}</li>
//           <li>🌐 <a href="http://www.valmodelivery.com">www.valmodelivery.com</a></li>
//         </ul>

//         <p><strong>Office Address:</strong><br>
//         3rd Floor, Wing-E, Helios Business Park, Kadubeesanahalli Village, Varthur Hobli, Outer Ring Road, Bellandur, Bangalore South, Karnataka, India, 560103</p>

//         <p>We look forward to your response and the opportunity to collaborate.</p>

//         <p>Best regards,<br>
//         ${manager.name}<br>
//         Business Development Team<br>
//         Valmo Logistics<br>
//         📧 <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a><br>
//         📞 ${manager.mobile}</p>

//         <p style="font-size: 12px; color: #888; margin-top: 20px;">
//           <strong>Disclaimer:</strong><br>
//           This email and its attachments are intended for the recipient(s) named above and may contain confidential or privileged information. If you are not the intended recipient, please notify the sender immediately by replying to this email and deleting it from your system. Any unauthorized use, disclosure, or distribution of this communication is prohibited. Valmo Logistics does not accept any responsibility for any loss or damage caused by the use of this email or its attachments.
//         </p>
//       </div>
//     `,
//     attachments: [
//       {
//         filename: "Valmo Application Form.pdf",
//         path: path.join(__dirname, "Valmo Application Form_compressed.pdf") // Ensure this file exists
//       },
//       {
//         filename: "Valmo Franchise Prospectus.pdf",
//         path: path.join(__dirname, "Valmo Franchise Prospectus_compressed.pdf") // Ensure this file exists
//       }
//     ]
//   };

//   await transporter.sendMail(mailOptions);
//   console.log("Email sent successfully to", user.email);
// };







const sendProposalMailFromUser = async (user, manager) => {
  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "hello@valmodelivery.com",
      pass: "Sanjay@9523"
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  });

  const mailOptions = {
    from: '"Valmo Logistics" <hello@valmodelivery.com>',
    to: user.email,
    subject: `🚀 Franchise Opportunity Available in Your Area – Partner with Valmo Logistics Today!`,
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: auto; background: #f9f9f9; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="background-color: #004aad; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0;">🚀 Franchise Opportunity – Join Valmo Logistics</h2>
      </div>

      <div style="padding: 20px; background-color: white; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Dear <strong>${user.name}</strong>,</p>

        <p style="font-size: 15px;">Greetings from <strong>Valmo Logistics</strong>! 🚛📦</p>

        <p style="font-size: 15px;">We’re thrilled to inform you that your preferred location and PIN code  
        
        
          ${user.pincodes.map((details, idx) => ` 
         
   
      <strong>( ${details.pincode}  –  ${details.post_offices.map((post_office) => `${post_office} , `).join("")})</strong>
     
     
         
      
     `)}
        
        
        
        are now available for a <strong>Valmo Franchise Partnership</strong>—a golden opportunity to join one of India’s fastest-growing logistics companies.</p>

        <h3 style="color: #004aad;">🌟 Why Partner with Valmo?</h3>
        <ul style="line-height: 1.6;">
          <li>🚀 <strong>9+ lakh</strong> orders shipped daily</li>
          <li>👥 <strong>30,000+</strong> delivery executives</li>
          <li>🤝 <strong>3,000+</strong> partners</li>
          <li>🌐 Serving <strong>6,000+</strong> PIN codes across India</li>
        </ul>

        <h3 style="color: #004aad;">📌 Franchise Models & Earnings</h3>
        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px;">
          <p><strong>1. Basic Model – ₹1,08,700 Total Investment</strong></p>
          <ul>
            <li>₹18,600 – PIN Code Registration Charge</li>
            <li>₹90,100 – Refundable Agreement Fee (within 90 days)</li>
            <li>📦 Earnings:💰 ₹30 per shipment (300 products/day commitment)</li>
            <li>❌ ₹7 per parcel if cancelled at your warehouse or office</li>
            <li>🚪 ₹15 per parcel if a customer cancels on the doorstep</li>
          </ul>
        </div>

        <br>

        <div style="background: #fff0f5; padding: 15px; border-radius: 8px;">
          <p><strong>2. FOCO Model (Full Company Ownership) – ₹3,08,700 Total Investment</strong></p>
          <ul>
            <li>Same benefits as Basic Model</li>
            <li>₹2,00,000 – Refundable Security Deposit</li>
            <li>➕ Additional Benefits:</li>
            <ul>
              <li>3 employees (salaries paid by Valmo)</li>
              <li>50% rent + electricity covered</li>
              <li>Fully furnished office setup</li>
              <li>Barcode scanner + 3 laptops provided</li>
            </ul>
          </ul>
        </div>

        <h3 style="color: #004aad;">📄 Required Documents</h3>
        <ul>
          <li>Aadhar/Voter ID</li>
          <li>PAN Card</li>
          <li>Bank Details</li>
          <li>Location Photos</li>
          <li>Passport-size Photo</li>
        </ul>

        <h3 style="color: #004aad;">✅ How to Apply</h3>
        <p>Our application process is fully online. Please upload all documents and complete the franchise form using the link below:</p>
        <p><a href="https://valmodelivery.com/registrationform.html?user=${manager.unique_code}" style="display: inline-block; background: #004aad; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">👉 Apply Now</a></p>

        <h3 style="color: #004aad;">📲 Contact for More Details</h3>
        <p>📞${manager.mobile}<br>
        📧 hello@valmodelivery.com<br>
        🌐 <a href="https://www.valmodelivery.com">www.valmodelivery.com</a></p>

        <h4 style="color: #004aad;">Office Address:</h4>
        <p>3rd Floor, Wing-E, Helios Business Park,<br>
        Kadubeesanahalli Village, Varthur Hobli,<br>
        Outer Ring Road, Bellandur, Bangalore South,<br>
        Karnataka, India – 560103</p>

        <p>Best Regards,<br>
        <strong>${manager.name}</strong><br>
        Business Development Team<br>
        Valmo Logistics</p>

        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: #555;"><strong>📧 Email Disclaimer:</strong><br>
        This message is intended only for the person or entity to which it is addressed. It may contain confidential and/or privileged material. If you are not the intended recipient, please notify the sender immediately and delete this email. Any unauthorized review, use, disclosure, or distribution is prohibited.</p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📩 Stylish Email sent successfully to", user.email);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};










const uproovalmail = async (user, manager) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "feedback@findiatm.net",
      pass: "Sanjay@9523"
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  });

  const mailOptions = {
    from: '"Indicash ATM" <feedback@findiatm.net>',
    to: user.email,
    subject: 'Your FINDI ATM Partnership Approval',
    html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
        }
        .content {
            padding: 20px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .highlight {
            background-color: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #0066cc;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>FINDI ATM - In association with Tata Indicash</h2>
    </div>
    
    <div class="content">
        <p>Dear ${user.fullName},</p>
        
        <p>We are pleased to inform you that your application and KYC verification have been successfully approved. Congratulations on qualifying to become a valued hosting partner of FINDI ATM – in association with Tata Indicash.</p>
        
        <div class="highlight">
            <p><strong>🔐 Your Login Credentials – FINDI ATM Partner Portal</strong></p>
            <p>🌐 Login URL:  <a href="https://findiatm.net/check-status/">https://findiatm.net/check-status/</a> </p>
            <p>🆔 Login ID: ${user.mobile}</p>
            <p>🔑 Password: ${user.password} </p>
            <p><em>For your security, please change your password upon first login.</em></p>
        </div>
        
        <p><strong>📌 Next Step: Confirm Your ATM Booking</strong></p>
        <p>To reserve your ATM installation and initiate the process, please pay the refundable application fee of ₹18,600 through the partner portal.</p>
        
        <p><span style="color: #d32f2f; font-weight: bold;">🕒 Deadline:</span> Kindly complete the payment within the next 3 hours to lock your booking and proceed.</p>
        
        <p>✅ Note: This fee is fully refundable if your site is not approved within 7 working days.</p>
        
        <p><strong>💼 Proposal Highlights – At a Glance:</strong></p>
        <ul>
            <li>💰 Monthly Rent: ₹25,000 (10% annual increment)</li>
            <li>💵 Advance Security Deposit: ₹11,00,000 (100% refundable)</li>
            <li>📝 Agreement Period: 18 years (3-year lock-in)</li>
            <li>🛡 Security Guards Provided: 2 (₹15,000/month each – company paid)</li>
            <li>🌐 100 Mbps Unlimited Internet – Free</li>
            <li>⚡ Electricity, Maintenance & Housekeeping – Fully Managed by Us</li>
            <li>🏧 ATM Installation Timeline: Within 15 days of payment</li>
            <li>⏱ Advance Payment Release: Within 24 hours post agreement signing</li>
        </ul>
        
        <p>If you need any assistance with the login or payment process, feel free to contact our team:</p>
        <p>📞 ${manager.mobile} <br>
         
        
        <p>We appreciate your prompt action and look forward to partnering with you.</p>
        
        <p>Warm regards,<br>
        FINDI ATM Team<br>
        In Association with Tata Indicash</p>
        
        <div class="footer">
            <p><strong>📜 Terms & Conditions:</strong></p>
            <p>Application fee must be paid via the official portal within the timeline to confirm booking.</p>
            <p>Site approval is subject to physical and technical verification.</p>
            <p>Refunds are processed per agreement terms if installation is not feasible.</p>
            <p>Agreement requires full site access and adherence to operational guidelines.</p>
            
            <p><strong>🔒 Privacy Policy:</strong></p>
            <p>We are committed to safeguarding your personal data. All submitted information is encrypted and used exclusively for verification and legal formalities. No third-party sharing occurs without your consent.</p>
            
            <p><strong>📧 Email Disclaimer:</strong></p>
            <p>This message and any attached files are intended only for the recipient. If you received it in error, please notify us and delete it. Do not disclose login details to any third party.</p>
        </div>
    </div>
</body>
</html>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully to", user.email);
};





app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Admin not found" });

  }
  if (password === "sanjay@952354" && username == "admin@952354") {
    return res.status(200).json({ message: "Login successful" });
  }

  return res.status(400).json({ message: "Admin not found" });
});







app.post("/submit-application", upload.fields([
  { name: "fileInput" },
  { name: "aadhaarInput" },
  { name: "aadhaarBackInput" },
  { name: "panInput" },
  { name: "bankInput" }
]), async (req, res) => {
  try {
      const body = req.body;

      // Append file paths
      body.fileInput = req.files.fileInput?.[0]?.path || "";
      body.aadhaarInput = req.files.aadhaarInput?.[0]?.path || "";
      body.aadhaarBackInput = req.files.aadhaarBackInput?.[0]?.path || "";
      body.panInput = req.files.panInput?.[0]?.path || "";
      body.bankInput = req.files.bankInput?.[0]?.path || "";

      // Save to DB
      const savedForm = await personalMailedForm.create(body);

      res.status(200).json({ message: "Form submitted successfully", data: savedForm });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Form submission failed" });
  }
});















app.post("/check-statusss", async (req, res) => {
  const { full_name, pin_code } = req.body;

  if (!full_name || !pin_code) {
    return res.status(400).json({ message: "Missing full name or pin code" });
  }

  try {
    const per = await personalMailedForm.find({});
    console.log(per)
    const person = await personalMailedForm.findOne({ mobile: full_name, password: pin_code });

    if (person) {
      return res.status(200).json({ message: "Login successful", id: person._id });
    } else {
      return res.status(400).json({ message: "user not found" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});