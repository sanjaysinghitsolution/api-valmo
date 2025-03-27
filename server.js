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
mongoose.connect("mongodb+srv://valmologestic:sanjay9523@cluster0.tb1f0.mongodb.net/valmoDB?retryWrites=true&w=majority&appName=Cluster0", {
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

  approval_fees_Comp: {
    type: Boolean,
    default: false
  },

  agreementFees_Comp: {
    type: Boolean,
    default: false
  },
  securityMoney_Comp: {
    type: Boolean,
    default: false
  }
,


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
  beneficiary_name: String,

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
    const { account_number, ifsc,beneficiary_name, branch, bank_name, holder_name } = req.body;

    // Find the bank by account_number and update or create a new document
    const updatedBank = await bank.findOneAndUpdate(
      { account_number }, // Find by account_number
      {
        ifsc,
        branch,
        bank_name,
        holder_name,
        beneficiary_name
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
    const leads = await Lead.find({ _id: { $in: user.leadList } }).sort({ createdAt: -1 });
    res.json(leads);

  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leads', error });
  }
})
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
app.get('/deleteAll/:collectionName', async (req, res) => {
  try {
    let collection;
    switch (req.params.collectionName) {
      case 'leads':
        collection = Lead;
        break;
      case 'proposals':
        collection = proposal;
        break;
      default:
        return res.status(400).json({ message: 'Invalid collection name' });
    }

    const deletedRecords = await collection.deleteMany({}); // Correct method call
    res.json({ 
      message: `${deletedRecords.deletedCount} records deleted successfully` 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting records', error: error.message });
  }
});
app.get('/leadFeesStatus/:userId/:feesBox', async (req, res) => {
  try {
    // Fetch the lead
    const lead = await Lead.findById(req.params.userId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Determine which field to update
    let collection;
    switch (req.params.feesBox.toLowerCase()) { // Convert to lowercase for case insensitivity
      case 'approoval':
        collection = "approval_fees_Comp";
        break;
      case 'agreement':
        collection = "agreementFees_Comp";
        break;
      case 'security':
        collection = "securityMoney_Comp";
        break;
      default:
        return res.status(400).json({ message: 'Invalid collection name' });
    }

    // Toggle the field value
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.userId,
      { [collection]: !lead[collection] }, // Toggle boolean value
      { new: true }
    );

    res.json({ 
      message: `Record updated successfully`,
      updatedLead
    });

  } catch (error) {
    res.status(500).json({ message: 'Error updating records', error: error.message });
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
app.get('/removeAssignedBank/:userId', async (req, res) => {
  console.log(req.params)
  try {
    const deletedBank = await Lead.findByIdAndUpdate(req.params.userId, {
      AssignedBank: null
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
    const manager = await User.findOne({unique_code:req.params.manager});
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
    const user = await Lead.findOne({ documentNumber: req.params.doc});
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

const sendMail = async (user,manager) => {
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
    subject: "Your Application Has Been Approved – Partnership Opportunity with Valmo Logistics",
    html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
              <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
                  <h2 style="text-align: center; color: #333;">Greetings from Valmo!</h2>
                  <p>Dear <strong>${user.username}</strong>,</p>
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

                  <h3>Recipient Details</h3>
                  <p><strong>Name:</strong> ${user.username}</p>
                  <p><strong>Address:</strong> ${user.address}</p>
                  <p><strong>Mobile No.:</strong> ${user.mobile}</p>
                  <p><strong>Email ID:</strong> ${user.email}</p>
                  <h3>Login Details</h3>
                  <p><strong>Login ID/Document No.:</strong> ${user.documentNumber}</p>
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
const sendProposalMailFromUser = async (user, manager) => {
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
    subject: "Proposal for Valmo Logistics Partnership – Preferred Location and PIN Code Availability",
    // html: `
    //   <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 800px; margin: 0 auto;">
    //     <h2 style="color: #1E88E5;">Dear ${user.name},</h2>
    //     <p>Greetings from Valmo!</p>
    //     <p>We are India’s most reliable and cost-effective logistics service partner, committed to streamlining logistics and ensuring a smooth and efficient delivery experience at the lowest cost.</p>
    //     <p>We are pleased to inform you that your preferred PIN code and location are available for a Valmo franchise partnership. This is a great opportunity to collaborate with one of India's fastest-growing logistics companies.</p>

    //     <h3 style="color: #1E88E5;">Why Partner with Valmo?</h3>
    //     <ul style="list-style-type: none; padding-left: 0;">
    //       <li>9+ lakh orders shipped daily</li>
    //       <li>30,000+ delivery executives</li>
    //       <li>3,000+ partners</li>
    //       <li>6,000+ PIN codes served</li>
    //     </ul>

    //     ${user.pincodes.map((details, idx) => ` <div> <h3 style="color: #1E88E5;">Preferred Location & PIN Code Availability ${idx + 1} :</h3>
    //   <p><strong>PIN Code Availability:</strong> ${details.pincode}</p>
    //   <p><strong>Location Availability:</strong></p>
    //   <ul>
    //     ${details.post_offices.map((post_office) => `<li>${post_office}</li>`).join("")}
    //   </ul> </div>`)}

    //     <h3 style="color: #1E88E5;">Franchise Opportunities & Earnings</h3>
    //     <p><strong>Delivery Franchise:</strong> ₹30 per Shipment (300 products daily commitment)</p>
        
    //     <p><strong>Profit Margin:</strong> 25-30%</p>
    //     <p><strong>Annual Profit Potential:</strong> ₹10-15 lakh per annum</p>

    //     <h3 style="color: #1E88E5;">Company Support Includes:</h3>
    //     <ul>
    //       <li>Comprehensive training for franchise owners & staff</li>
    //       <li>Advanced software & order tracking tools</li>
    //       <li>Barcode scanner, fingerprint scanner</li>
    //       <li>Marketing materials (banners, posters, etc.)</li>
    //       <li>Doorstep stock delivery</li>
    //       <li>Vehicles for shipment & delivery</li>
    //       <li>Loading & unloading support</li>
    //     </ul>

    //     <h3 style="color: #1E88E5;">Company Benefits for Franchise Partners:</h3>
    //     <ul>
    //       <li>Company pays salary for 3 employees</li>
    //       <li>50% rent & electricity bill covered</li>
    //       <li>Company-designed interiors</li>
    //       <li>All necessary products & equipment provided</li>
    //       <li>Space requirement: 200-500 sq. ft.</li>
    //     </ul>

    //     <h3 style="color: #1E88E5;">Investment & Financial Information</h3>
    //     <p><strong>Registration Fee:</strong> ₹18600 </p>
    //     <p><strong>Security Money:</strong> 90% refundable after the agreement</p>
    //     <p><strong>Interest Earned on Security Deposit:</strong> 7.5% annually</p>
    //     <p><strong>Interest Calculation Example:</strong> ₹2,00,000 × 7.5% × 1 year = ₹15,000 per annum</p>
    //     <p><strong>One-time Setup Fee:</strong> ₹2,00,000 (lifetime investment)</p>
    //     <p><strong>Agreement Fee:</strong> ₹90,100 (fully refundable)</p>
    //     <p><strong>Total Payment:</strong> ₹3,08,700 (refundable except for registration fee)</p>

    //     <h3 style="color: #1E88E5;">Required Documents:</h3>
    //     <ul>
    //       <li>Aadhar card/Voter ID Card</li>
    //       <li>PAN Card</li>
    //       <li>Bank Account Details</li>
    //       <li>Location images & details</li>
    //       <li>One passport-size photograph</li>
    //     </ul>

    //     <p>We believe this partnership will be mutually beneficial, and we are excited about the possibility of collaborating with you.</p>

    //     <h3 style="color: #1E88E5;">To Proceed with This Opportunity:</h3>
    //     <ol>
    //       <li>Kindly fill out the attached application form.</li>
    //       <li>Please also attach the necessary documents mentioned above and send them back to us via email at <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a>.</li>
    //     </ol>

    //     <p>Additionally, I have attached Valmo Franchisee Prospects for your reference. These documents will provide you with further insights into our business and partnership details.</p>

    //     <p>Our Business Development Team is available for any questions or additional information you may need. You can also reach us at:</p>
    //     <ul>
    //       <li>📧 <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a></li>
    //       <li>📞 ${manager.mobile}</li>
    //       <li>🌐 <a href="http://www.valmodelivery.com">www.valmodelivery.com</a></li>
    //     </ul>

    //     <p><strong>Office Address:</strong><br>
    //     3rd Floor, Wing-E, Helios Business Park, Kadubeesanahalli Village, Varthur Hobli, Outer Ring Road, Bellandur, Bangalore South, Karnataka, India, 560103</p>

    //     <p>We look forward to your response and the opportunity to collaborate.</p>

    //     <p>Best regards,<br>
    //     ${manager.name}<br>
    //     Business Development Team<br>
    //     Valmo Logistics<br>
    //     📧 <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a><br>
    //     📞 ${manager.mobile}</p>

    //     <p style="font-size: 12px; color: #888; margin-top: 20px;">
    //       <strong>Disclaimer:</strong><br>
    //       This email and its attachments are intended for the recipient(s) named above and may contain confidential or privileged information. If you are not the intended recipient, please notify the sender immediately by replying to this email and deleting it from your system. Any unauthorized use, disclosure, or distribution of this communication is prohibited. Valmo Logistics does not accept any responsibility for any loss or damage caused by the use of this email or its attachments.
    //     </p>
    //   </div>
    // `,
    
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Valmo Logistics Franchise Opportunity 🚛</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            padding: 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            color: #ff6b6b;
            border-bottom: 2px solid #4ecdc4;
            padding-bottom: 5px;
        }
        .content p {
            line-height: 1.6;
        }
        .highlight {
            background: #fff3f3;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        .model-box {
            background: #e6f3ff;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            background: #4ecdc4;
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px 0;
        }
        .button:hover {
            background: #ff6b6b;
        }
        .footer {
            background: #333;
            color: #fff;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .emoji {
            font-size: 20px;
            margin: 0 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Greetings from Valmo Logistics! 🚛📦</h1>
        </div>
        <div class="content">
            <p>Dear ${user.name},</p>
            <p>We are thrilled to announce that your preferred location and PIN code are available for a <strong>Valmo Franchise Partnership</strong>! 🎉 This is your chance to team up with one of India’s most reliable and cost-effective logistics partners. 🚚💼</p>

            <h2>Why Partner with Valmo? 🌟</h2>
            <div class="highlight">
                <p><span class="emoji">✅</span> 9+ lakh orders shipped daily</p>
                <p><span class="emoji">✅</span> 30,000+ delivery executives</p>
                <p><span class="emoji">✅</span> 3,000+ partners</p>
                <p><span class="emoji">✅</span> 6,000+ PIN codes served</p>
            </div>

             ${user.pincodes.map((details, idx) => ` <div> <h3 style="color: #1E88E5;">Preferred Location & PIN Code Availability ${idx + 1} :</h3>
      <p><strong>PIN Code Availability:</strong> ${details.pincode}</p>
      <p><strong>Location Availability:</strong></p>
      <ul>
        ${details.post_offices.map((post_office) => `<li>${post_office}</li>`).join("")}
      </ul> </div>`)}

            <h2>Franchise Opportunities & Earnings 💰</h2>
            <p>We offer two exciting franchise models:</p>

            <div class="model-box">
                <h3>1. Basic Model 💼</h3>
                <p><strong>Total Investment:</strong> ₹1,08,700</p>
                <p><span class="emoji">💸</span> ₹18,600 as registration charge for PIN code booking</p>
                <p><span class="emoji">💸</span> ₹90,100 as agreement fee (fully refundable within 90 days)</p>
                <p><em>Includes login credentials for our logistics management software.</em></p>
                <p><strong>Earnings:</strong></p>
                <p><span class="emoji">💰</span> ₹30 per shipment (300 products/day commitment)</p>
                <p><span class="emoji">💰</span> ₹7 per parcel if cancelled at your warehouse</p>
                <p><span class="emoji">💰</span> ₹15 per parcel if customer cancels on doorstep</p>
            </div>

            <div class="model-box">
                <h3>2. FOCO Model (Full Company Ownership) 🚚</h3>
                <p><strong>Total Investment:</strong> ₹3,08,700</p>
                <p><span class="emoji">💸</span> ₹18,600 as registration charge for PIN code booking</p>
                <p><span class="emoji">💸</span> ₹90,100 as agreement fee (fully refundable within 90 days)</p>
                <p><span class="emoji">💸</span> ₹2,00,000 as security deposit (refundable on exit)</p>
                <p><strong>Earnings:</strong></p>
                <p><span class="emoji">💰</span> ₹30 per shipment (300 products/day commitment)</p>
                <p><span class="emoji">💰</span> ₹7 per parcel if cancelled at your warehouse</p>
                <p><span class="emoji">💰</span> ₹15 per parcel if customer cancels on doorstep</p>
                <p><strong>Additional Benefits:</strong></p>
                <p><span class="emoji">👷</span> 3 employees provided by Valmo (salaries ~₹15,000/month each)</p>
                <p><span class="emoji">🏢</span> 50% rent & electricity bill covered</p>
                <p><span class="emoji">🖼️</span> Company-designed office interiors</p>
                <p><span class="emoji">🛠️</span> Barcode machine + 3 laptops with accessories</p>
            </div>

            <h2>Required Documents 📜</h2>
            <p><span class="emoji">🖌️</span> Aadhar Card/Voter ID</p>
            <p><span class="emoji">🖌️</span> PAN Card</p>
            <p><span class="emoji">🖌️</span> Bank Account Details</p>
            <p><span class="emoji">🖌️</span> Location Images</p>
            <p><span class="emoji">🖌️</span> Passport-size Photograph</p>

            <h2>How to Proceed? 🚀</h2>
            <p>Please fill out the application form, attach the required documents, and send them to:</p>
            <p><span class="emoji">📧</span> <a href="mailto:hello@valmodelivery.com">hello@valmodelivery.com</a></p>
            <p><em>Login credentials for Valmo Logistics Management Software will be shared upon application receipt.</em></p>

            <a href="mailto:hello@valmodelivery.com" class="button">Apply Now! 🎯</a>
        </div>

        <div class="footer">
            <p><strong>For More Details, Contact Us:</strong></p>
            <p><span class="emoji">📞</span> ${manager.mobile} | <span class="emoji">📧</span> hello@valmodelivery.com | <span class="emoji">🌐</span> www.valmodelivery.com</p>
            <p><span class="emoji">📍</span> 3rd Floor, Wing-E, Helios Business Park, Kadubeesanahalli Village, Varthur Hobli, Outer Ring Road, Bellandur, Bangalore South, Karnataka, India, 560103</p>
            <p>We’re excited to partner with you! 🤝</p>
            <p><em>Best regards,<br>${manager.name}<br>Business Development Team<br>Valmo Logistics</em></p>
            <p style="margin-top: 20px;">📢 <em>Email Disclaimer: This email is confidential. If you’re not the intended recipient, please delete it and notify us. Unauthorized use is prohibited. Valmo Logistics isn’t liable for errors due to email transmission.</em></p>
        </div>
    </div>
</body>
</html>
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
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Admin not found" });
  }
  if (password === "admin123" && username == "admin123") {
    return res.status(200).json({ message: "Login successful" });
  }

  return res.status(400).json({ message: "Admin not found" });
});
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});