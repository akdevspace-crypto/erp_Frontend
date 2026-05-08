export type DemoModuleKey =
    | 'crm.activeEnquiries'
    | 'crm.admissionTracking'
    | 'healthcare.criticalPatients'
    | 'healthcare.patientDashboard'
    | 'healthcare.medication'
    | 'healthcare.nutrition'
    | 'healthcare.adl'
    | 'operations.foodPreparation'
    | 'operations.nutritionPlanning'
    | 'operations.laundry'
    | 'operations.maintenance'
    | 'operations.waste'
    | 'inventory.lowStock'
    | 'inventory.ration'
    | 'inventory.stationary'
    | 'inventory.electrical'
    | 'inventory.assets'
    | 'inventory.stock'
    | 'inventory.purchaseOrders'
    | 'finance.pendingPayments'
    | 'finance.invoice'
    | 'finance.renewals'
    | 'security.gate'
    | 'security.visitors'
    | 'security.entryLogs'
    | 'security.otpLogs'
    | 'omnichannel.unifiedInbox'
    | 'omnichannel.email'
    | 'omnichannel.whatsapp'
    | 'omnichannel.sms'
    | 'omnichannel.calls'
    | 'omnichannel.missedCalls'

export type DemoRow = Record<string, string | number>

export interface DemoModuleData {
    title: string
    module: string
    searchPlaceholder: string
    columns: Array<{ key: string; header: string }>
    rows: DemoRow[]
}

const status = {
    hot: 'HOT',
    warm: 'WARM',
    cold: 'COLD',
    admitted: 'ADMITTED',
    pending: 'PENDING',
    closed: 'CLOSED',
    open: 'OPEN',
    progress: 'IN_PROGRESS',
    completed: 'COMPLETED',
    escalated: 'ESCALATED',
    paid: 'PAID',
    overdue: 'OVERDUE'
}

const patientRows = [
    { id: 'PAT-1024', patient: 'Meera Nair', metric: 'BP 168/98', status: 'CRITICAL', owner: 'Nurse Kavya', due: 'Due now' },
    { id: 'PAT-1031', patient: 'Rohan Menon', metric: 'SpO2 88%', status: 'CRITICAL', owner: 'Dr Arjun', due: '10 min' },
    { id: 'PAT-1045', patient: 'Lakshmi Rao', metric: 'Temp 101.4 F', status: 'WATCH', owner: 'Nurse Diya', due: '25 min' },
    { id: 'PAT-1058', patient: 'Suresh Iyer', metric: 'Pulse 118', status: 'CRITICAL', owner: 'Nurse Farah', due: 'Now' },
    { id: 'PAT-1072', patient: 'Ananya Das', metric: 'BP 154/94', status: 'WATCH', owner: 'Caregiver Nila', due: '45 min' }
]

export const erpDemoData: Record<DemoModuleKey, DemoModuleData> = {
    'crm.activeEnquiries': {
        title: 'Active Enquiries',
        module: 'Enquiry Desk',
        searchPlaceholder: 'Search active enquiries...',
        columns: [
            { key: 'id', header: 'Lead ID' },
            { key: 'name', header: 'Client' },
            { key: 'service', header: 'Service' },
            { key: 'status', header: 'Priority' },
            { key: 'owner', header: 'Assigned Staff' },
            { key: 'due', header: 'Follow-up' }
        ],
        rows: [
            { id: 'ENQ-2401', name: 'Aarav Sharma', service: 'In-House Assisted Living', status: status.hot, owner: 'Meera Nair', due: 'Today 11:30 AM' },
            { id: 'ENQ-2408', name: 'Priya Menon', service: 'Dementia Care', status: status.hot, owner: 'Kavya Rao', due: 'Overdue 2h' },
            { id: 'ENQ-2412', name: 'Karthik Iyer', service: 'Skilled Nursing', status: status.warm, owner: 'Arjun Das', due: 'Tomorrow' },
            { id: 'ENQ-2420', name: 'Farah Khan', service: 'Post Operative Care', status: status.pending, owner: 'Nila Thomas', due: 'Friday' }
        ]
    },
    'crm.admissionTracking': {
        title: 'Admission Tracking',
        module: 'Enquiry Desk',
        searchPlaceholder: 'Search admissions...',
        columns: [
            { key: 'id', header: 'Admission ID' },
            { key: 'name', header: 'Client' },
            { key: 'service', header: 'Care Plan' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Coordinator' },
            { key: 'due', header: 'Bed/Room' }
        ],
        rows: [
            { id: 'ADM-1184', name: 'Vivaan Reddy', service: 'Memory Care', status: status.admitted, owner: 'Saanvi Kumar', due: 'Room A-204' },
            { id: 'ADM-1190', name: 'Janani Bose', service: 'Assisted Living', status: 'DOCUMENTS_PENDING', owner: 'Naveen Patel', due: 'Room B-108' },
            { id: 'ADM-1197', name: 'George Thomas', service: 'Critical Observation', status: 'PAYMENT_PENDING', owner: 'Diya Iyer', due: 'Room C-012' }
        ]
    },
    'healthcare.criticalPatients': {
        title: 'Critical Patients',
        module: 'Healthcare',
        searchPlaceholder: 'Search critical patients...',
        columns: [
            { key: 'id', header: 'Patient ID' },
            { key: 'patient', header: 'Patient' },
            { key: 'metric', header: 'Live Vitals' },
            { key: 'status', header: 'Flag' },
            { key: 'owner', header: 'Care Owner' },
            { key: 'due', header: 'Review' }
        ],
        rows: patientRows
    },
    'healthcare.patientDashboard': {
        title: 'Patient Dashboard',
        module: 'Healthcare',
        searchPlaceholder: 'Search patients...',
        columns: [
            { key: 'id', header: 'Patient ID' },
            { key: 'patient', header: 'Patient' },
            { key: 'metric', header: 'Vitals' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Assigned Nurse' },
            { key: 'due', header: 'Next Round' }
        ],
        rows: [
            ...patientRows,
            { id: 'PAT-1080', patient: 'Ishaan Varma', metric: 'BP 126/82', status: 'STABLE', owner: 'Nurse Ananya', due: '2:00 PM' },
            { id: 'PAT-1094', patient: 'Kavya Pillai', metric: 'SpO2 96%', status: 'STABLE', owner: 'Nurse Rohan', due: '4:30 PM' }
        ]
    },
    'healthcare.medication': {
        title: 'Medication Management',
        module: 'Healthcare',
        searchPlaceholder: 'Search medication schedules...',
        columns: [
            { key: 'id', header: 'Schedule ID' },
            { key: 'patient', header: 'Patient' },
            { key: 'medication', header: 'Medication' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Nurse' },
            { key: 'due', header: 'Due' }
        ],
        rows: [
            { id: 'MED-7001', patient: 'Meera Nair', medication: 'Amlodipine 1-0-1', status: 'DUE', owner: 'Nurse Kavya', due: 'Now' },
            { id: 'MED-7008', patient: 'Rohan Menon', medication: 'Nebulization SOS', status: 'ALERT', owner: 'Nurse Diya', due: '10 min' },
            { id: 'MED-7012', patient: 'Lakshmi Rao', medication: 'Metformin 0-1-0', status: 'SCHEDULED', owner: 'Nurse Farah', due: '1:00 PM' }
        ]
    },
    'healthcare.nutrition': {
        title: 'Nutrition & Diet',
        module: 'Healthcare',
        searchPlaceholder: 'Search diet plans...',
        columns: [
            { key: 'id', header: 'Diet ID' },
            { key: 'patient', header: 'Patient' },
            { key: 'plan', header: 'Diet Plan' },
            { key: 'calories', header: 'Calories' },
            { key: 'status', header: 'Status' }
        ],
        rows: [
            { id: 'DIE-3101', patient: 'Ananya Das', plan: 'Diabetic soft diet', calories: 1600, status: 'ACTIVE' },
            { id: 'DIE-3108', patient: 'Suresh Iyer', plan: 'Low sodium diet', calories: 1500, status: 'ACTIVE' },
            { id: 'DIE-3114', patient: 'Ishaan Varma', plan: 'High protein plan', calories: 1900, status: 'REVIEW' }
        ]
    },
    'healthcare.adl': {
        title: 'ADL (Daily Living)',
        module: 'Healthcare',
        searchPlaceholder: 'Search ADL logs...',
        columns: [
            { key: 'id', header: 'Log ID' },
            { key: 'patient', header: 'Patient' },
            { key: 'activity', header: 'Activity' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Caregiver' }
        ],
        rows: [
            { id: 'ADL-5102', patient: 'Meera Nair', activity: 'Bath assist + mobility', status: status.completed, owner: 'Caregiver Nila' },
            { id: 'ADL-5109', patient: 'Rohan Menon', activity: 'Feeding support', status: status.progress, owner: 'Caregiver Aarav' },
            { id: 'ADL-5118', patient: 'Lakshmi Rao', activity: 'Evening walk', status: status.pending, owner: 'Caregiver Saanvi' }
        ]
    },
    'operations.foodPreparation': {
        title: 'Food Preparation',
        module: 'Operations',
        searchPlaceholder: 'Search food schedules...',
        columns: [
            { key: 'id', header: 'Batch ID' },
            { key: 'meal', header: 'Meal' },
            { key: 'count', header: 'Servings' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Owner' }
        ],
        rows: [
            { id: 'FOOD-901', meal: 'Diabetic lunch', count: 42, status: status.progress, owner: 'Cook Arjun' },
            { id: 'FOOD-918', meal: 'Soft dinner', count: 68, status: status.open, owner: 'Cook Lakshmi' },
            { id: 'FOOD-923', meal: 'High protein snack', count: 30, status: status.completed, owner: 'Diet Team' }
        ]
    },
    'operations.nutritionPlanning': {
        title: 'Nutrition Planning',
        module: 'Operations',
        searchPlaceholder: 'Search nutrition plans...',
        columns: [
            { key: 'id', header: 'Plan ID' },
            { key: 'name', header: 'Plan' },
            { key: 'count', header: 'Patients' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Dietician' }
        ],
        rows: [
            { id: 'NUT-801', name: 'Renal diet cycle', count: 11, status: status.open, owner: 'Dr Priya' },
            { id: 'NUT-817', name: 'Low sodium review', count: 24, status: status.progress, owner: 'Dr Meera' },
            { id: 'NUT-829', name: 'High protein recovery', count: 16, status: status.completed, owner: 'Dr Rohan' }
        ]
    },
    'operations.laundry': {
        title: 'Laundry Management',
        module: 'Operations',
        searchPlaceholder: 'Search laundry batches...',
        columns: [
            { key: 'id', header: 'Batch ID' },
            { key: 'name', header: 'Batch' },
            { key: 'count', header: 'Items' },
            { key: 'status', header: 'Status' },
            { key: 'due', header: 'Dispatch' }
        ],
        rows: [
            { id: 'LND-601', name: 'Block A linen', count: 84, status: status.progress, due: 'Today 4 PM' },
            { id: 'LND-614', name: 'Critical care gowns', count: 32, status: status.escalated, due: 'Overdue' },
            { id: 'LND-620', name: 'Resident clothes', count: 119, status: status.completed, due: 'Done' }
        ]
    },
    'operations.maintenance': {
        title: 'Maintenance',
        module: 'Operations',
        searchPlaceholder: 'Search maintenance tickets...',
        columns: [
            { key: 'id', header: 'Ticket ID' },
            { key: 'name', header: 'Issue' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Technician' },
            { key: 'due', header: 'SLA' }
        ],
        rows: [
            { id: 'MNT-4201', name: 'Nurse call bell - Room B108', status: status.escalated, owner: 'PrimeFix', due: '1h' },
            { id: 'MNT-4215', name: 'Bathroom plumbing - Block A', status: status.progress, owner: 'Suresh', due: 'Today' },
            { id: 'MNT-4220', name: 'Generator service', status: status.open, owner: 'Vendor', due: 'Tomorrow' }
        ]
    },
    'operations.waste': {
        title: 'Waste Management',
        module: 'Operations',
        searchPlaceholder: 'Search waste disposal logs...',
        columns: [
            { key: 'id', header: 'Log ID' },
            { key: 'name', header: 'Type' },
            { key: 'count', header: 'Weight' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Vendor' }
        ],
        rows: [
            { id: 'WST-2101', name: 'Biomedical waste', count: '18 kg', status: status.completed, owner: 'MediSafe' },
            { id: 'WST-2109', name: 'Kitchen wet waste', count: '42 kg', status: status.progress, owner: 'City Green' },
            { id: 'WST-2118', name: 'Rag disposal', count: '12 kg', status: status.open, owner: 'Housekeeping' }
        ]
    },
    'inventory.lowStock': {
        title: 'Low Stock Alerts',
        module: 'Inventory',
        searchPlaceholder: 'Search low stock alerts...',
        columns: [
            { key: 'id', header: 'SKU' },
            { key: 'name', header: 'Product' },
            { key: 'category', header: 'Category' },
            { key: 'quantity', header: 'Qty' },
            { key: 'threshold', header: 'Threshold' },
            { key: 'status', header: 'Status' }
        ],
        rows: [
            { id: 'SKU-042', name: 'Pulse Oximeter', category: 'medical', quantity: 3, threshold: 12, status: 'REORDER' },
            { id: 'SKU-117', name: 'Gloves Box', category: 'medical', quantity: 8, threshold: 40, status: 'LOW' },
            { id: 'SKU-220', name: 'Rice Bag', category: 'ration', quantity: 5, threshold: 20, status: 'LOW' }
        ]
    },
    'inventory.ration': {
        title: 'Ration Products',
        module: 'Inventory',
        searchPlaceholder: 'Search ration products...',
        columns: [
            { key: 'id', header: 'SKU' },
            { key: 'name', header: 'Product' },
            { key: 'quantity', header: 'Stock' },
            { key: 'vendor', header: 'Vendor' },
            { key: 'expiry', header: 'Expiry' }
        ],
        rows: [
            { id: 'RAT-001', name: 'Rice Bag 25kg', quantity: 46, vendor: 'FreshKart Foods', expiry: '2026-09-12' },
            { id: 'RAT-018', name: 'Toor Dal 10kg', quantity: 18, vendor: 'Sri Lakshmi Traders', expiry: '2026-08-02' },
            { id: 'RAT-026', name: 'Cooking Oil Tin', quantity: 22, vendor: 'Prime Groceries', expiry: '2026-11-20' }
        ]
    },
    'inventory.stationary': {
        title: 'Stationary Products',
        module: 'Inventory',
        searchPlaceholder: 'Search stationary products...',
        columns: [
            { key: 'id', header: 'SKU' },
            { key: 'name', header: 'Product' },
            { key: 'quantity', header: 'Stock' },
            { key: 'vendor', header: 'Vendor' },
            { key: 'status', header: 'Status' }
        ],
        rows: [
            { id: 'STA-014', name: 'Patient File', quantity: 240, vendor: 'OfficeKart', status: 'OK' },
            { id: 'STA-028', name: 'A4 Paper Rim', quantity: 32, vendor: 'PaperLine', status: 'WATCH' },
            { id: 'STA-041', name: 'ID Card Holder', quantity: 64, vendor: 'OfficeKart', status: 'OK' }
        ]
    },
    'inventory.electrical': {
        title: 'Electrical & Plumbing Products',
        module: 'Inventory',
        searchPlaceholder: 'Search electrical and plumbing products...',
        columns: [
            { key: 'id', header: 'SKU' },
            { key: 'name', header: 'Product' },
            { key: 'category', header: 'Category' },
            { key: 'quantity', header: 'Stock' },
            { key: 'status', header: 'Status' }
        ],
        rows: [
            { id: 'ELP-004', name: 'LED Tube Light', category: 'electrical', quantity: 18, status: 'OK' },
            { id: 'ELP-019', name: 'PVC Pipe', category: 'plumbing', quantity: 11, status: 'LOW' },
            { id: 'ELP-030', name: 'Angle Valve', category: 'plumbing', quantity: 7, status: 'REORDER' }
        ]
    },
    'inventory.assets': {
        title: 'Asset Products',
        module: 'Inventory',
        searchPlaceholder: 'Search assets...',
        columns: [
            { key: 'id', header: 'Asset ID' },
            { key: 'name', header: 'Asset' },
            { key: 'location', header: 'Location' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Custodian' }
        ],
        rows: [
            { id: 'AST-1004', name: 'Oxygen Concentrator', location: 'Critical Care', status: 'IN_USE', owner: 'Nurse Kavya' },
            { id: 'AST-1011', name: 'Wheelchair', location: 'Block A', status: 'AVAILABLE', owner: 'Admin Desk' },
            { id: 'AST-1028', name: 'Hospital Bed', location: 'Room B108', status: 'IN_USE', owner: 'Care Team' }
        ]
    },
    'inventory.stock': {
        title: 'Stock Management',
        module: 'Inventory',
        searchPlaceholder: 'Search stock...',
        columns: [
            { key: 'id', header: 'Movement ID' },
            { key: 'name', header: 'Product' },
            { key: 'quantity', header: 'Quantity' },
            { key: 'status', header: 'Movement' },
            { key: 'owner', header: 'Handled By' }
        ],
        rows: [
            { id: 'STK-8001', name: 'Gloves Box', quantity: '-12', status: 'ISSUED', owner: 'Nurse Station' },
            { id: 'STK-8018', name: 'Rice Bag 25kg', quantity: '+20', status: 'RECEIVED', owner: 'Store Admin' },
            { id: 'STK-8030', name: 'Pulse Oximeter', quantity: '-2', status: 'TRANSFER', owner: 'Critical Care' }
        ]
    },
    'inventory.purchaseOrders': {
        title: 'Purchase Orders',
        module: 'Inventory',
        searchPlaceholder: 'Search purchase orders...',
        columns: [
            { key: 'id', header: 'PO No' },
            { key: 'name', header: 'Vendor' },
            { key: 'amount', header: 'Amount' },
            { key: 'status', header: 'Status' },
            { key: 'due', header: 'ETA' }
        ],
        rows: [
            { id: 'PO-7011', name: 'MediTrust Agencies', amount: 'Rs 48,200', status: 'APPROVED', due: 'Tomorrow' },
            { id: 'PO-7024', name: 'FreshKart Foods', amount: 'Rs 22,800', status: status.pending, due: 'Today' },
            { id: 'PO-7030', name: 'PrimeFix Services', amount: 'Rs 14,900', status: 'RAISED', due: 'Friday' }
        ]
    },
    'finance.pendingPayments': {
        title: 'Pending Payments',
        module: 'Finance',
        searchPlaceholder: 'Search pending payments...',
        columns: [
            { key: 'id', header: 'Invoice' },
            { key: 'name', header: 'Client' },
            { key: 'amount', header: 'Amount' },
            { key: 'status', header: 'Status' },
            { key: 'due', header: 'Due Date' }
        ],
        rows: [
            { id: 'INV-3101', name: 'Aarav Sharma', amount: 'Rs 72,000', status: status.overdue, due: '2 days ago' },
            { id: 'INV-3115', name: 'Priya Menon', amount: 'Rs 38,500', status: 'PARTIAL', due: 'Today' },
            { id: 'INV-3120', name: 'Karthik Iyer', amount: 'Rs 64,000', status: status.pending, due: 'Friday' }
        ]
    },
    'finance.invoice': {
        title: 'Invoice',
        module: 'Finance',
        searchPlaceholder: 'Search invoices...',
        columns: [
            { key: 'id', header: 'Invoice' },
            { key: 'name', header: 'Client' },
            { key: 'amount', header: 'Amount' },
            { key: 'status', header: 'Status' },
            { key: 'due', header: 'Period' }
        ],
        rows: [
            { id: 'INV-3008', name: 'Janani Bose', amount: 'Rs 68,000', status: status.paid, due: 'May 2026' },
            { id: 'INV-3015', name: 'Vivaan Reddy', amount: 'Rs 82,000', status: 'PARTIAL', due: 'May 2026' },
            { id: 'INV-3022', name: 'George Thomas', amount: 'Rs 45,500', status: status.pending, due: 'May 2026' }
        ]
    },
    'finance.renewals': {
        title: 'Renewals',
        module: 'Finance',
        searchPlaceholder: 'Search renewals...',
        columns: [
            { key: 'id', header: 'Renewal ID' },
            { key: 'name', header: 'Client' },
            { key: 'amount', header: 'Monthly Value' },
            { key: 'status', header: 'Status' },
            { key: 'due', header: 'Renewal Date' }
        ],
        rows: [
            { id: 'REN-1201', name: 'Meera Nair', amount: 'Rs 65,000', status: 'DUE_SOON', due: '2026-05-12' },
            { id: 'REN-1210', name: 'Rohan Menon', amount: 'Rs 72,000', status: 'CONFIRMED', due: '2026-05-18' },
            { id: 'REN-1228', name: 'Suresh Iyer', amount: 'Rs 58,000', status: status.pending, due: '2026-05-22' }
        ]
    },
    'security.gate': {
        title: 'Gate Management',
        module: 'Security',
        searchPlaceholder: 'Search gate movement...',
        columns: [
            { key: 'id', header: 'Log ID' },
            { key: 'name', header: 'Visitor/Vehicle' },
            { key: 'purpose', header: 'Purpose' },
            { key: 'status', header: 'Status' },
            { key: 'due', header: 'Time' }
        ],
        rows: [
            { id: 'GAT-9001', name: 'TN38 AB 4921', purpose: 'Ambulance entry', status: 'CLEARED', due: '09:20 AM' },
            { id: 'GAT-9014', name: 'FreshKart Van', purpose: 'Ration delivery', status: 'CHECKING', due: '10:05 AM' },
            { id: 'GAT-9020', name: 'PrimeFix Technician', purpose: 'Maintenance', status: 'INSIDE', due: '10:40 AM' }
        ]
    },
    'security.visitors': {
        title: 'Visitor Management',
        module: 'Security',
        searchPlaceholder: 'Search visitors...',
        columns: [
            { key: 'id', header: 'Pass ID' },
            { key: 'name', header: 'Visitor' },
            { key: 'host', header: 'Host' },
            { key: 'purpose', header: 'Purpose' },
            { key: 'status', header: 'Status' }
        ],
        rows: [
            { id: 'VIS-5001', name: 'Ramesh Kumar', host: 'Meera Nair', purpose: 'Patient visit', status: 'INSIDE' },
            { id: 'VIS-5012', name: 'Anita Rao', host: 'Admin Desk', purpose: 'Interview', status: 'WAITING' },
            { id: 'VIS-5020', name: 'Sanjay Das', host: 'Maintenance', purpose: 'Vendor visit', status: 'EXITED' }
        ]
    },
    'security.entryLogs': {
        title: 'Entry Logs',
        module: 'Security',
        searchPlaceholder: 'Search entry logs...',
        columns: [
            { key: 'id', header: 'Entry ID' },
            { key: 'name', header: 'Name' },
            { key: 'purpose', header: 'Purpose' },
            { key: 'entry', header: 'Entry' },
            { key: 'exit', header: 'Exit' }
        ],
        rows: [
            { id: 'ENT-7401', name: 'Ramesh Kumar', purpose: 'Patient visit', entry: '09:20 AM', exit: '-' },
            { id: 'ENT-7410', name: 'FreshKart Van', purpose: 'Delivery', entry: '08:40 AM', exit: '09:05 AM' },
            { id: 'ENT-7422', name: 'MediTrust Courier', purpose: 'Medicine handover', entry: '10:30 AM', exit: '10:44 AM' }
        ]
    },
    'security.otpLogs': {
        title: 'OTP Logs',
        module: 'Security',
        searchPlaceholder: 'Search OTP logs...',
        columns: [
            { key: 'id', header: 'OTP ID' },
            { key: 'name', header: 'Recipient' },
            { key: 'purpose', header: 'Purpose' },
            { key: 'status', header: 'Status' },
            { key: 'due', header: 'Time' }
        ],
        rows: [
            { id: 'OTP-8101', name: 'Ramesh Kumar', purpose: 'Visitor entry', status: 'VERIFIED', due: '09:18 AM' },
            { id: 'OTP-8112', name: 'MediTrust Courier', purpose: 'Medicine handover', status: 'VERIFIED', due: '10:28 AM' },
            { id: 'OTP-8124', name: 'Unknown Visitor', purpose: 'Gate access', status: 'FAILED', due: '10:55 AM' }
        ]
    },
    'omnichannel.unifiedInbox': {
        title: 'Unified Inbox',
        module: 'Omnichannel',
        searchPlaceholder: 'Search conversations...',
        columns: [
            { key: 'id', header: 'Thread' },
            { key: 'name', header: 'Customer' },
            { key: 'channel', header: 'Channel' },
            { key: 'status', header: 'Status' },
            { key: 'due', header: 'Last Message' }
        ],
        rows: [
            { id: 'CNV-2101', name: 'Aarav Sharma', channel: 'WhatsApp', status: 'UNREAD', due: '2 min ago' },
            { id: 'CNV-2118', name: 'Priya Menon', channel: 'Email', status: 'ESCALATED', due: '18 min ago' },
            { id: 'CNV-2130', name: 'Karthik Iyer', channel: 'Call', status: 'MISSED', due: '34 min ago' }
        ]
    },
    'omnichannel.email': {
        title: 'Email',
        module: 'Omnichannel',
        searchPlaceholder: 'Search email conversations...',
        columns: [
            { key: 'id', header: 'Email ID' },
            { key: 'name', header: 'Customer' },
            { key: 'subject', header: 'Subject' },
            { key: 'status', header: 'Read' },
            { key: 'due', header: 'Time' }
        ],
        rows: [
            { id: 'EML-9001', name: 'Priya Menon', subject: 'Admission documents', status: 'UNREAD', due: '09:15 AM' },
            { id: 'EML-9014', name: 'Vivaan Reddy', subject: 'Invoice clarification', status: 'READ', due: 'Yesterday' }
        ]
    },
    'omnichannel.whatsapp': {
        title: 'WhatsApp',
        module: 'Omnichannel',
        searchPlaceholder: 'Search WhatsApp chats...',
        columns: [
            { key: 'id', header: 'Chat ID' },
            { key: 'name', header: 'Customer' },
            { key: 'message', header: 'Last Message' },
            { key: 'status', header: 'Delivery' },
            { key: 'due', header: 'Time' }
        ],
        rows: [
            { id: 'WSP-4101', name: 'Aarav Sharma', message: 'Need bed availability today', status: 'READ', due: '2 min ago' },
            { id: 'WSP-4118', name: 'Janani Bose', message: 'Payment screenshot sent', status: 'DELIVERED', due: '12 min ago' }
        ]
    },
    'omnichannel.sms': {
        title: 'SMS',
        module: 'Omnichannel',
        searchPlaceholder: 'Search sms...',
        columns: [
            { key: 'id', header: 'SMS ID' },
            { key: 'name', header: 'Customer' },
            { key: 'message', header: 'Message' },
            { key: 'status', header: 'Delivery' },
            { key: 'due', header: 'Time' }
        ],
        rows: [
            { id: 'SMS-2201', name: 'Rohan Menon', message: 'Payment reminder sent', status: 'DELIVERED', due: '10:12 AM' },
            { id: 'SMS-2215', name: 'Lakshmi Rao', message: 'Follow-up appointment reminder', status: 'SENT', due: '11:00 AM' }
        ]
    },
    'omnichannel.calls': {
        title: 'Calls',
        module: 'Omnichannel',
        searchPlaceholder: 'Search calls...',
        columns: [
            { key: 'id', header: 'Call ID' },
            { key: 'name', header: 'Customer' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Agent' },
            { key: 'due', header: 'Time' }
        ],
        rows: [
            { id: 'CALL-1201', name: 'Karthik Iyer', status: 'MISSED', owner: 'Care Desk', due: '34 min ago' },
            { id: 'CALL-1214', name: 'Meera Nair', status: 'COMPLETED', owner: 'Saanvi', due: '09:45 AM' }
        ]
    },
    'omnichannel.missedCalls': {
        title: 'Missed Calls',
        module: 'Omnichannel',
        searchPlaceholder: 'Search missed calls...',
        columns: [
            { key: 'id', header: 'Call ID' },
            { key: 'name', header: 'Caller' },
            { key: 'status', header: 'Status' },
            { key: 'owner', header: 'Callback Owner' },
            { key: 'due', header: 'Missed At' }
        ],
        rows: [
            { id: 'MISS-8001', name: 'Karthik Iyer', status: 'CALLBACK_DUE', owner: 'Care Desk', due: '34 min ago' },
            { id: 'MISS-8010', name: 'Farah Khan', status: 'ESCALATED', owner: 'CRM Lead', due: '1h ago' }
        ]
    }
}
