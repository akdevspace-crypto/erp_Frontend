import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import { ToastProvider } from './components/Toast'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SkeletonLoader, GlobalSpinner } from './components/SkeletonLoader'
import { ErrorBoundary } from './components/ErrorBoundary'

// Auth
import { Login } from './features/auth/pages/Login'

// Lazy loaded modules
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))

// Master
const CityMaster = lazy(() => import('./features/master/pages/CityMaster').then(m => ({ default: m.CityMaster })))
const UnitMaster = lazy(() => import('./features/master/pages/UnitMaster').then(m => ({ default: m.UnitMaster })))
const PaymentCategoryMaster = lazy(() => import('./features/master/pages/PaymentCategoryMaster').then(m => ({ default: m.PaymentCategoryMaster })))
const ClientServicesMaster = lazy(() => import('./features/master/pages/ClientServicesMaster').then(m => ({ default: m.ClientServicesMaster })))
const DepartmentMaster = lazy(() => import('./features/master/pages/DepartmentMaster').then(m => ({ default: m.DepartmentMaster })))
const DesignationMaster = lazy(() => import('./features/master/pages/DesignationMaster').then(m => ({ default: m.DesignationMaster })))
const LabourServicesMaster = lazy(() => import('./features/master/pages/LabourServicesMaster').then(m => ({ default: m.LabourServicesMaster })))
const VendorMaster = lazy(() => import('./features/master/pages/VendorMaster').then(m => ({ default: m.VendorMaster })))
const RoomManagementMaster = lazy(() => import('./features/master/pages/RoomManagementMaster').then(m => ({ default: m.RoomManagementMaster })))

// Enquiry & Allocation
const EnquiryFollowUp = lazy(() => import('./features/enquiry/pages/EnquiryFollowUp').then(m => ({ default: m.EnquiryFollowUp })))
const NewEnquiry = lazy(() => import('./features/enquiry/pages/NewEnquiry').then(m => ({ default: m.NewEnquiry })))
const AllClients = lazy(() => import('./features/enquiry/pages/AllClients').then(m => ({ default: m.AllClients })))
const FollowUpView = lazy(() => import('./features/enquiry/pages/FollowUpView').then(m => ({ default: m.FollowUpView })))
const HomeCare = lazy(() => import('./features/allocation/pages/HomeCare').then(m => ({ default: m.HomeCare })))
const ClinicalCare = lazy(() => import('./features/allocation/pages/ClinicalCare').then(m => ({ default: m.ClinicalCare })))
const AllocInHouseCare = lazy(() => import('./features/allocation/pages/InHouseCare').then(m => ({ default: m.InHouseCare })))
const OthersAllocation = lazy(() => import('./features/allocation/pages/Others').then(m => ({ default: m.OthersAllocation })))

// Business & Customer Care
const WelcomeCall = lazy(() => import('./features/business/pages/WelcomeCall').then(m => ({ default: m.WelcomeCall })))
const PendingFeedback = lazy(() => import('./features/customer_care/pages/PendingFeedback').then(m => ({ default: m.PendingFeedback })))
const Complaints = lazy(() => import('./features/customer_care/pages/Complaints').then(m => ({ default: m.Complaints })))
const ServiceHistory = lazy(() => import('./features/customer_care/pages/ServiceHistory').then(m => ({ default: m.ServiceHistory })))

// In-House & Accounts
const Revenue = lazy(() => import('./features/inhouse_care/pages/Revenue').then(m => ({ default: m.Revenue })))
const Vitals = lazy(() => import('./features/inhouse_care/pages/Vitals').then(m => ({ default: m.Vitals })))
const Cashbox = lazy(() => import('./features/accounts/pages/Cashbox').then(m => ({ default: m.Cashbox })))
const CashboxPending = lazy(() => import('./features/accounts/pages/CashboxPending').then(m => ({ default: m.CashboxPending })))
const Income = lazy(() => import('./features/accounts/pages/Income').then(m => ({ default: m.Income })))
const Expense = lazy(() => import('./features/accounts/pages/Expense').then(m => ({ default: m.Expense })))
const InHouseExpense = lazy(() => import('./features/accounts/pages/InHouseExpense').then(m => ({ default: m.InHouseExpense })))

// HR, CMS, Tasks, Profile
const StaffManagement = lazy(() => import('./features/hr/pages/StaffManagement').then(m => ({ default: m.StaffManagement })))
const StaffPrivilege = lazy(() => import('./features/hr/pages/StaffPrivilege').then(m => ({ default: m.StaffPrivilege })))
const StaffMenuPrivilege = lazy(() => import('./features/hr/pages/StaffMenuPrivilege').then(m => ({ default: m.StaffMenuPrivilege })))
const RolesPermissions = lazy(() => import('./features/hr/pages/RolesPermissions').then(m => ({ default: m.RolesPermissions })))
const LabourManagement = lazy(() => import('./features/hr/pages/LabourManagement').then(m => ({ default: m.LabourManagement })))
const Attendance = lazy(() => import('./features/hr/pages/Attendance').then(m => ({ default: m.Attendance })))
const Payroll = lazy(() => import('./features/hr/pages/Payroll').then(m => ({ default: m.Payroll })))
const JobEnquiry = lazy(() => import('./features/hr/pages/JobEnquiry').then(m => ({ default: m.JobEnquiry })))
const HolidayMapping = lazy(() => import('./features/hr/pages/HolidayMapping').then(m => ({ default: m.HolidayMapping })))
const Blogs = lazy(() => import('./features/cms/pages/Blogs').then(m => ({ default: m.Blogs })))
const FAQPage = lazy(() => import('./features/cms/pages/FAQ').then(m => ({ default: m.FAQPage })))
const Events = lazy(() => import('./features/cms/pages/Events').then(m => ({ default: m.Events })))
const Notifications = lazy(() => import('./features/profile/pages/Notifications').then(m => ({ default: m.Notifications })))
const AssignDailyTask = lazy(() => import('./features/task_log/pages/AssignDailyTask').then(m => ({ default: m.AssignDailyTask })))
const AssignScheduleTask = lazy(() => import('./features/task_log/pages/AssignScheduleTask').then(m => ({ default: m.AssignScheduleTask })))
const DailyTaskApproval = lazy(() => import('./features/task_log/pages/DailyTaskApproval').then(m => ({ default: m.DailyTaskApproval })))
const ScheduleTaskApproval = lazy(() => import('./features/task_log/pages/ScheduleTaskApproval').then(m => ({ default: m.ScheduleTaskApproval })))
const MyProfile = lazy(() => import('./features/profile/pages/MyProfile').then(m => ({ default: m.MyProfile })))
const MyTasks = lazy(() => import('./features/profile/pages/MyTasks').then(m => ({ default: m.MyTasks })))
const AutomationDashboard = lazy(() => import('./features/automation/pages/AutomationDashboard').then(m => ({ default: m.AutomationDashboard })))
const EnterpriseIntelligence = lazy(() => import('./features/automation/pages/EnterpriseIntelligence').then(m => ({ default: m.EnterpriseIntelligence })))
const RuleBuilder = lazy(() => import('./features/automation/pages/RuleBuilder').then(m => ({ default: m.RuleBuilder })))

// CRM New Modules
const ActiveEnquiries = lazy(() => import('./features/crm/pages/ActiveEnquiries').then(m => ({ default: m.ActiveEnquiries })))
const AdmissionTracking = lazy(() => import('./features/crm/pages/AdmissionTracking').then(m => ({ default: m.AdmissionTracking })))

// Healthcare New Modules
const CriticalPatients = lazy(() => import('./features/healthcare/pages/CriticalPatients').then(m => ({ default: m.CriticalPatients })))
const PatientDashboard = lazy(() => import('./features/healthcare/pages/PatientDashboard').then(m => ({ default: m.PatientDashboard })))
const MedicationManagement = lazy(() => import('./features/healthcare/pages/MedicationManagement').then(m => ({ default: m.MedicationManagement })))
const NutritionDiet = lazy(() => import('./features/healthcare/pages/NutritionDiet').then(m => ({ default: m.NutritionDiet })))
const ADL = lazy(() => import('./features/healthcare/pages/ADL').then(m => ({ default: m.ADLDailyLiving })))

// Operations New Modules
const FoodPreparation = lazy(() => import('./features/operations/pages/FoodPreparation').then(m => ({ default: m.FoodPreparation })))
const NutritionPlanning = lazy(() => import('./features/operations/pages/NutritionPlanning').then(m => ({ default: m.NutritionPlanning })))
const LaundryManagement = lazy(() => import('./features/operations/pages/LaundryManagement').then(m => ({ default: m.LaundryManagement })))
const Maintenance = lazy(() => import('./features/operations/pages/Maintenance').then(m => ({ default: m.Maintenance })))
const WasteManagement = lazy(() => import('./features/operations/pages/WasteManagement').then(m => ({ default: m.WasteManagement })))

// Inventory New Modules
const LowStockAlerts = lazy(() => import('./features/inventory/pages/LowStockAlerts').then(m => ({ default: m.LowStockAlerts })))
const ProductsRation = lazy(() => import('./features/inventory/pages/ProductsRation').then(m => ({ default: m.RationProducts })))
const ProductsStationary = lazy(() => import('./features/inventory/pages/ProductsStationary').then(m => ({ default: m.StationaryProducts })))
const ProductsElectrical = lazy(() => import('./features/inventory/pages/ProductsElectrical').then(m => ({ default: m.ElectricalPlumbingProducts })))
const ProductsAssets = lazy(() => import('./features/inventory/pages/ProductsAssets').then(m => ({ default: m.AssetProducts })))
const Stock = lazy(() => import('./features/inventory/pages/Stock').then(m => ({ default: m.StockManagement })))
const PurchaseOrders = lazy(() => import('./features/inventory/pages/PurchaseOrders').then(m => ({ default: m.PurchaseOrders })))

// Finance New Modules
const PendingPayments = lazy(() => import('./features/finance/pages/PendingPayments').then(m => ({ default: m.PendingPayments })))
const Invoice = lazy(() => import('./features/finance/pages/Invoice').then(m => ({ default: m.Invoice })))
const Renewals = lazy(() => import('./features/finance/pages/Renewals').then(m => ({ default: m.Renewals })))

// Security New Modules
const GateManagement = lazy(() => import('./features/security/pages/GateManagement').then(m => ({ default: m.GateManagement })))
const VisitorManagement = lazy(() => import('./features/security/pages/VisitorManagement').then(m => ({ default: m.VisitorManagement })))
const EntryLogs = lazy(() => import('./features/security/pages/EntryLogs').then(m => ({ default: m.EntryLogs })))
const OTPLogs = lazy(() => import('./features/security/pages/OTPLogs').then(m => ({ default: m.OTPLogs })))

// Omnichannel New Modules
const UnifiedInbox = lazy(() => import('./features/omnichannel/pages/UnifiedInbox').then(m => ({ default: m.UnifiedInbox })))
const Email = lazy(() => import('./features/omnichannel/pages/Email').then(m => ({ default: m.Email })))
const WhatsApp = lazy(() => import('./features/omnichannel/pages/WhatsApp').then(m => ({ default: m.WhatsApp })))
const SMS = lazy(() => import('./features/omnichannel/pages/SMS').then(m => ({ default: m.SMS })))
const Calls = lazy(() => import('./features/omnichannel/pages/Calls').then(m => ({ default: m.Calls })))
const MissedCalls = lazy(() => import('./features/omnichannel/pages/MissedCalls').then(m => ({ default: m.MissedCalls })))

// App Routing
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<GlobalSpinner />}>
            <Routes>
              {/* Public Route */}
              <Route path="/auth/login" element={<Login />} />

              {/* Protected Routes Wrapper */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />

                  <Route path="dashboard" element={
                    <Suspense fallback={<SkeletonLoader />}><Dashboard /></Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<SkeletonLoader />}><Settings /></Suspense>
                  } />

                  {/* Master Module */}
                  <Route path="master/city" element={<Suspense fallback={<SkeletonLoader />}><CityMaster /></Suspense>} />
                  <Route path="master/unit" element={<Suspense fallback={<SkeletonLoader />}><UnitMaster /></Suspense>} />
                  <Route path="master/client-services" element={<Suspense fallback={<SkeletonLoader />}><ClientServicesMaster /></Suspense>} />
                  <Route path="master/department" element={<Suspense fallback={<SkeletonLoader />}><DepartmentMaster /></Suspense>} />
                  <Route path="master/designation" element={<Suspense fallback={<SkeletonLoader />}><DesignationMaster /></Suspense>} />

                  {/* Automation Module */}
                  <Route path="automation/dashboard" element={<Suspense fallback={<SkeletonLoader />}><AutomationDashboard /></Suspense>} />
                  <Route path="automation/intelligence" element={<Suspense fallback={<SkeletonLoader />}><EnterpriseIntelligence /></Suspense>} />
                  <Route path="automation/rules" element={<Suspense fallback={<SkeletonLoader />}><RuleBuilder /></Suspense>} />
                  <Route path="master/labour-services" element={<Suspense fallback={<SkeletonLoader />}><LabourServicesMaster /></Suspense>} />
                  <Route path="master/payment-category" element={<Suspense fallback={<SkeletonLoader />}><PaymentCategoryMaster /></Suspense>} />
                  <Route path="master/vendor" element={<Suspense fallback={<SkeletonLoader />}><VendorMaster /></Suspense>} />
                  <Route path="master/room" element={<Suspense fallback={<SkeletonLoader />}><RoomManagementMaster /></Suspense>} />

                  {/* Enquiry Module */}
                  <Route path="enquiry/follow-up" element={<Suspense fallback={<SkeletonLoader />}><EnquiryFollowUp /></Suspense>} />
                  <Route path="enquiry/follow-up/:id" element={<Suspense fallback={<SkeletonLoader />}><FollowUpView /></Suspense>} />
                  <Route path="enquiry/new" element={<Suspense fallback={<SkeletonLoader />}><NewEnquiry /></Suspense>} />
                  <Route path="enquiry/clients" element={<Suspense fallback={<SkeletonLoader />}><AllClients /></Suspense>} />
                  <Route path="crm/enquiry-follow-up" element={<Suspense fallback={<SkeletonLoader />}><EnquiryFollowUp /></Suspense>} />
                  <Route path="crm/enquiry-follow-up/:id" element={<Suspense fallback={<SkeletonLoader />}><FollowUpView /></Suspense>} />
                  <Route path="crm/new-enquiry" element={<Suspense fallback={<SkeletonLoader />}><NewEnquiry /></Suspense>} />
                  <Route path="crm/clients" element={<Suspense fallback={<SkeletonLoader />}><AllClients /></Suspense>} />

                  {/* Allocation Module */}
                  <Route path="allocation/home-care" element={<Suspense fallback={<SkeletonLoader />}><HomeCare /></Suspense>} />
                  <Route path="allocation/clinical-care" element={<Suspense fallback={<SkeletonLoader />}><ClinicalCare /></Suspense>} />
                  <Route path="allocation/inhouse-care" element={<Suspense fallback={<SkeletonLoader />}><AllocInHouseCare /></Suspense>} />
                  <Route path="allocation/others" element={<Suspense fallback={<SkeletonLoader />}><OthersAllocation /></Suspense>} />

                  {/* Business Desk */}
                  <Route path="business/welcome-call" element={<Suspense fallback={<SkeletonLoader />}><WelcomeCall /></Suspense>} />

                  {/* Customer Care */}
                  <Route path="customer-care/pending-feedback" element={<Suspense fallback={<SkeletonLoader />}><PendingFeedback /></Suspense>} />
                  <Route path="customer-care/complaints" element={<Suspense fallback={<SkeletonLoader />}><Complaints /></Suspense>} />
                  <Route path="customer-care/service-history" element={<Suspense fallback={<SkeletonLoader />}><ServiceHistory /></Suspense>} />

                  {/* In-House Care */}
                  <Route path="inhouse-care/revenue" element={<Suspense fallback={<SkeletonLoader />}><Revenue /></Suspense>} />
                  <Route path="inhouse-care/vitals" element={<Suspense fallback={<SkeletonLoader />}><Vitals /></Suspense>} />
                  <Route path="healthcare/vitals" element={<Suspense fallback={<SkeletonLoader />}><Vitals /></Suspense>} />

                  {/* Accounts Module */}
                  <Route path="accounts/cashbox" element={<Suspense fallback={<SkeletonLoader />}><Cashbox /></Suspense>} />
                  <Route path="accounts/pending" element={<Suspense fallback={<SkeletonLoader />}><CashboxPending /></Suspense>} />
                  <Route path="accounts/income" element={<Suspense fallback={<SkeletonLoader />}><Income /></Suspense>} />
                  <Route path="accounts/expense" element={<Suspense fallback={<SkeletonLoader />}><Expense /></Suspense>} />
                  <Route path="accounts/inhouse-expense" element={<Suspense fallback={<SkeletonLoader />}><InHouseExpense /></Suspense>} />
                  <Route path="finance/cashbox" element={<Suspense fallback={<SkeletonLoader />}><Cashbox /></Suspense>} />
                  <Route path="finance/income" element={<Suspense fallback={<SkeletonLoader />}><Income /></Suspense>} />
                  <Route path="finance/expense" element={<Suspense fallback={<SkeletonLoader />}><Expense /></Suspense>} />
                  <Route path="finance/inhouse-expense" element={<Suspense fallback={<SkeletonLoader />}><InHouseExpense /></Suspense>} />

                  {/* HR Module */}
                  <Route path="hr/staff" element={<Suspense fallback={<SkeletonLoader />}><StaffManagement /></Suspense>} />
                  <Route path="hr/staff-privilege" element={<Suspense fallback={<SkeletonLoader />}><StaffPrivilege /></Suspense>} />
                  <Route path="hr/staff-privilege/:id/edit" element={<Suspense fallback={<SkeletonLoader />}><StaffMenuPrivilege /></Suspense>} />
                  <Route path="hr/rbac" element={<Suspense fallback={<SkeletonLoader />}><RolesPermissions /></Suspense>} />
                  <Route path="hr/labour" element={<Suspense fallback={<SkeletonLoader />}><LabourManagement /></Suspense>} />
                  <Route path="hr/recruitment" element={<Suspense fallback={<SkeletonLoader />}><JobEnquiry /></Suspense>} />
                  <Route path="hr/attendance" element={<Suspense fallback={<SkeletonLoader />}><Attendance /></Suspense>} />
                  <Route path="hr/holiday" element={<Suspense fallback={<SkeletonLoader />}><HolidayMapping /></Suspense>} />
                  <Route path="hr/payroll" element={<Suspense fallback={<SkeletonLoader />}><Payroll /></Suspense>} />

                  {/* CMS Module */}
                  <Route path="cms/blogs" element={<Suspense fallback={<SkeletonLoader />}><Blogs /></Suspense>} />
                  <Route path="cms/faq" element={<Suspense fallback={<SkeletonLoader />}><FAQPage /></Suspense>} />
                  <Route path="cms/events" element={<Suspense fallback={<SkeletonLoader />}><Events /></Suspense>} />

                  {/* Profile Module */}
                  <Route path="profile/notifications" element={<Suspense fallback={<SkeletonLoader />}><Notifications /></Suspense>} />
                  <Route path="profile/me" element={<Suspense fallback={<SkeletonLoader />}><MyProfile /></Suspense>} />
                  <Route path="profile/tasks" element={<Suspense fallback={<SkeletonLoader />}><MyTasks /></Suspense>} />

                  {/* Task Log Module */}
                  <Route path="task-log/assign-daily" element={<Suspense fallback={<SkeletonLoader />}><AssignDailyTask /></Suspense>} />
                  <Route path="task-log/assign-schedule" element={<Suspense fallback={<SkeletonLoader />}><AssignScheduleTask /></Suspense>} />
                  <Route path="task-log/daily-approval" element={<Suspense fallback={<SkeletonLoader />}><DailyTaskApproval /></Suspense>} />
                  <Route path="task-log/schedule-approval" element={<Suspense fallback={<SkeletonLoader />}><ScheduleTaskApproval /></Suspense>} />

                  {/* CRM New Routes */}
                  <Route path="crm/active-enquiries" element={<Suspense fallback={<SkeletonLoader />}><ActiveEnquiries /></Suspense>} />
                  <Route path="crm/admission-tracking" element={<Suspense fallback={<SkeletonLoader />}><AdmissionTracking /></Suspense>} />

                  {/* Healthcare New Routes */}
                  <Route path="healthcare/critical-patients" element={<Suspense fallback={<SkeletonLoader />}><CriticalPatients /></Suspense>} />
                  <Route path="healthcare/patient-dashboard" element={<Suspense fallback={<SkeletonLoader />}><PatientDashboard /></Suspense>} />
                  <Route path="healthcare/medication-management" element={<Suspense fallback={<SkeletonLoader />}><MedicationManagement /></Suspense>} />
                  <Route path="healthcare/nutrition-diet" element={<Suspense fallback={<SkeletonLoader />}><NutritionDiet /></Suspense>} />
                  <Route path="healthcare/adl" element={<Suspense fallback={<SkeletonLoader />}><ADL /></Suspense>} />

                  {/* Operations New Routes */}
                  <Route path="operations/food-preparation" element={<Suspense fallback={<SkeletonLoader />}><FoodPreparation /></Suspense>} />
                  <Route path="operations/nutrition-planning" element={<Suspense fallback={<SkeletonLoader />}><NutritionPlanning /></Suspense>} />
                  <Route path="operations/laundry-management" element={<Suspense fallback={<SkeletonLoader />}><LaundryManagement /></Suspense>} />
                  <Route path="operations/maintenance" element={<Suspense fallback={<SkeletonLoader />}><Maintenance /></Suspense>} />
                  <Route path="operations/waste-management" element={<Suspense fallback={<SkeletonLoader />}><WasteManagement /></Suspense>} />

                  {/* Inventory New Routes */}
                  <Route path="inventory/low-stock-alerts" element={<Suspense fallback={<SkeletonLoader />}><LowStockAlerts /></Suspense>} />
                  <Route path="inventory/products/ration" element={<Suspense fallback={<SkeletonLoader />}><ProductsRation /></Suspense>} />
                  <Route path="inventory/products/stationary" element={<Suspense fallback={<SkeletonLoader />}><ProductsStationary /></Suspense>} />
                  <Route path="inventory/products/electrical-plumbing" element={<Suspense fallback={<SkeletonLoader />}><ProductsElectrical /></Suspense>} />
                  <Route path="inventory/products/assets" element={<Suspense fallback={<SkeletonLoader />}><ProductsAssets /></Suspense>} />
                  <Route path="inventory/stock" element={<Suspense fallback={<SkeletonLoader />}><Stock /></Suspense>} />
                  <Route path="inventory/purchase-orders" element={<Suspense fallback={<SkeletonLoader />}><PurchaseOrders /></Suspense>} />
                  <Route path="inventory/vendors" element={<Suspense fallback={<SkeletonLoader />}><VendorMaster /></Suspense>} />

                  {/* Finance New Routes */}
                  <Route path="finance/pending-payments" element={<Suspense fallback={<SkeletonLoader />}><PendingPayments /></Suspense>} />
                  <Route path="finance/invoice" element={<Suspense fallback={<SkeletonLoader />}><Invoice /></Suspense>} />
                  <Route path="finance/renewals" element={<Suspense fallback={<SkeletonLoader />}><Renewals /></Suspense>} />

                  {/* Security New Routes */}
                  <Route path="security/gate-management" element={<Suspense fallback={<SkeletonLoader />}><GateManagement /></Suspense>} />
                  <Route path="security/visitor-management" element={<Suspense fallback={<SkeletonLoader />}><VisitorManagement /></Suspense>} />
                  <Route path="security/entry-logs" element={<Suspense fallback={<SkeletonLoader />}><EntryLogs /></Suspense>} />
                  <Route path="security/otp-logs" element={<Suspense fallback={<SkeletonLoader />}><OTPLogs /></Suspense>} />

                  {/* Omnichannel New Routes */}
                  <Route path="omnichannel/conversations" element={<Suspense fallback={<SkeletonLoader />}><UnifiedInbox /></Suspense>} />
                  <Route path="omnichannel/email" element={<Suspense fallback={<SkeletonLoader />}><Email /></Suspense>} />
                  <Route path="omnichannel/whatsapp" element={<Suspense fallback={<SkeletonLoader />}><WhatsApp /></Suspense>} />
                  <Route path="omnichannel/sms" element={<Suspense fallback={<SkeletonLoader />}><SMS /></Suspense>} />
                  <Route path="omnichannel/missed-calls" element={<Suspense fallback={<SkeletonLoader />}><MissedCalls /></Suspense>} />
                  <Route path="omnichannel/calls" element={<Suspense fallback={<SkeletonLoader />}><Calls /></Suspense>} />

                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
