import { useState } from 'react'
import { FileText, Smartphone } from 'lucide-react'
import { PageHeader } from '../../../components/PageHeader';
// api import removed
import html2pdf from 'html2pdf.js';

const Field = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
    <div>
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-primary-500"
        />
    </div>
)

const SubsidyField = ({ label, priceObj, onChange }: any) => (
    <div>
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</label>
        <div className="flex gap-2">
            <div className="flex-1">
                <input
                    type="number"
                    placeholder="Price (₹)"
                    value={priceObj?.price || ''}
                    onChange={(e) => onChange({ ...priceObj, price: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-primary-500"
                />
            </div>
            <div className="flex-1">
                <input
                    type="number"
                    placeholder="Subsidy (₹)"
                    value={priceObj?.subsidy || ''}
                    onChange={(e) => onChange({ ...priceObj, subsidy: e.target.value })}
                    className="h-10 w-full rounded-lg border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700 outline-none focus:border-orange-500 placeholder:text-orange-300"
                />
            </div>
        </div>
    </div>
)

const Select = ({ label, value, onChange, options }: any) => (
    <div>
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-primary-500 bg-white"
        >
            <option value="">Select...</option>
            {options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
)

const htmlEscape = (str: string | number) =>
    String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

const invoiceMoney = (val: number | string | null | undefined) =>
    Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function PatientManualBilling() {
    const [isSending, setIsSending] = useState(false)
    const [billType, setBillType] = useState<'ELDER_CARE' | 'HOME_CARE'>('ELDER_CARE')

    // Header Fields
    const [patientName, setPatientName] = useState('')
    const [patientAge, setPatientAge] = useState('')
    const [patientSex, setPatientSex] = useState('')
    const [patientDob, setPatientDob] = useState('')
    const [patientId, setPatientId] = useState('')

    const [billId, setBillId] = useState('')
    const [billingMonthYear, setBillingMonthYear] = useState('')

    const [guardianName, setGuardianName] = useState('')
    const [guardianContact, setGuardianContact] = useState('')
    const [guardianAddress, setGuardianAddress] = useState('')
    const [upiId, setUpiId] = useState('mab.037347029020081@axisbank')

    // Payment Info
    const [paymentInfo, setPaymentInfo] = useState({
        doneDate: '', receivedDate: '', mode: '', bankName: '', gpay: '', receivingMode: '', balanceAmount: '', balanceItem: ''
    })

    // Core Elder Care Fields
    const initField = (price?: any) => ({ price: String(price || ''), subsidy: '' });
    const [balances, setBalances] = useState({
        amount: initField(''), monthlyEssentials: initField(''), diapers: initField(''), gloves: initField(''), mask: initField(''), underpad: initField('')
    })

    const [elderCore, setElderCore] = useState({
        roomSharing: '', billSelection: '', monthlyBedCharge: initField(''), amount: initField(''), laundry: initField('1800'), eb: initField('700'), hospitalVisit: initField(''), ambulance: initField(''), doctorCheckup: initField('500'), physiotherapy: initField(''), counseling: initField(''), occupational: initField(''), speech: initField(''), nursing: initField(''), caregiverDay: initField(''), caregiverNight: initField(''), dressing: initField(''), firstAid: initField(''), specialCare: initField(''), gas: initField('1000')
    })

    const [attender, setAttender] = useState({ shift: '', price: '', subsidy: '' })
    const [outsideAttender, setOutsideAttender] = useState({ shift: '', price: '', subsidy: '' })

    // Medical Products (Complex Logic)
    const [medical, setMedical] = useState({
        medicines: { count: '', baseAmount: '100', subsidy: '' },
        diapers: { qty: '', rate: '70', disposal: '', subsidy: '' },
        gloves: { qty: '', rate: '75', disposal: '', subsidy: '' },
        mask: { qty: '', rate: '4', disposal: '', subsidy: '' },
        underpad: { qty: '', rate: '60', disposal: '', subsidy: '' },
        rubbersheet: { qty: '', rate: '700', disposal: '', subsidy: '' },
        readymade: { qty: '', rate: '1500', disposal: '', subsidy: '' },
        uroBag: { price: '', subsidy: '' },
        catheter: { price: '', subsidy: '' },
        labTest: { price: '', subsidy: '' }
    })

    // Food
    const [food, setFood] = useState({
        milk: initField('500'), juice: initField(''), snacks: initField('300'), herbalDrinks: initField('200')
    })

    // Consumables & Services
    const [consumables, setConsumables] = useState({
        newDress: initField(''), towel: initField(''), bedsheets: initField(''), bedspread: initField(''), newDressStitching: initField(''), oldDressStitching: initField(''), allOut: initField('300'), tv: initField(''), breakage: initField(''), cleaning: initField(''), windingUp: initField(''), beauty: initField('600'), monthlyEssentials: initField(''), cylinder: initField('')
    })

    // Totals & Subsidies
    const [totals, setTotals] = useState({
        lateFee: '', lateMaterialFee: '', uncfSubsidyAmount: '0', uncfSubsidiaryItems: '', totalReversibleItems: ''
    })

    // Home Care Fields
    const [homeFields, setHomeFields] = useState<Record<string, { rs: string; qty?: string; subsidy?: string }>>({
        'Monthly Membership options (1/2/3)': { rs: '' },
        'Homecare services': { rs: '' },
        'Care giver shift (Partial/day/night/24*7)': { rs: '' },
        'Nursing care (Partial/day/night/24*7)': { rs: '' },
        'Lab test': { rs: '' },
        'Transport ambulance or taxi': { rs: '' },
        'Physiotherapy': { rs: '' },
        'Counseling': { rs: '' },
        'Beauty services': { rs: '' },
        'Legal services': { rs: '' },
        'Rendering services': { rs: '' },
        'Yoga': { rs: '' },
        'Surgical Equipments': { rs: '' },
        'Doctor (General or Speciality)': { rs: '' },
        'Pooja services': { rs: '' },
        'LATE FEE': { rs: '' },
        'UNCF Subsidy': { rs: '0' }
    })

    // Calculators
    const calcMedTotal = (key: keyof typeof medical) => {
        const item = medical[key] as any
        if (key === 'medicines') {
            return (parseFloat(item.count) || 0) + (parseFloat(item.baseAmount) || 0)
        }
        if ('qty' in item && 'rate' in item && 'disposal' in item) {
            return ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)) + (parseFloat(item.disposal) || 0)
        }
        return parseFloat(item.price) || 0
    }


    const calculateTotals = () => {
        let grossTotal = 0;
        let totalSubsidy = 0;

        if (billType === 'ELDER_CARE') {
            // Helper to add from an object
            const addFromObj = (obj: any) => {
                Object.values(obj).forEach(val => {
                    if (typeof val === 'object' && val !== null) {
                        grossTotal += (parseFloat((val as any).price) || 0);
                        totalSubsidy += (parseFloat((val as any).subsidy) || 0);
                    } else if (typeof val === 'string' || typeof val === 'number') {
                        // Some fields might just be strings
                        grossTotal += (parseFloat(String(val)) || 0);
                    }
                });
            };

            addFromObj(elderCore);
            addFromObj(balances);
            grossTotal += parseFloat(attender.price) || 0;
            grossTotal += parseFloat(outsideAttender.price) || 0;

            // Medical
            Object.keys(medical).forEach(k => {
                const item = medical[k as keyof typeof medical] as any;
                if (k === 'medicines') {
                    grossTotal += (parseFloat(item.count) || 0) + (parseFloat(item.baseAmount) || 0);
                    totalSubsidy += (parseFloat(item.subsidy) || 0);
                } else if ('qty' in item && 'rate' in item && 'disposal' in item) {
                    grossTotal += ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)) + (parseFloat(item.disposal) || 0);
                    totalSubsidy += (parseFloat(item.subsidy) || 0);
                } else {
                    grossTotal += parseFloat(item.price) || 0;
                    totalSubsidy += parseFloat(item.subsidy) || 0;
                }
            });

            addFromObj(food);
            addFromObj(consumables);

            grossTotal += parseFloat(totals.lateFee) || 0;
            grossTotal += parseFloat(totals.lateMaterialFee) || 0;
            // Also include UNCF global subsidy amount
            totalSubsidy += parseFloat(totals.uncfSubsidyAmount) || 0;

        } else {
            Object.keys(homeFields).forEach((key) => {
                if (key !== 'UNCF Subsidy') {
                    grossTotal += parseFloat(String(homeFields[key].rs).replace(/[^0-9.]/g, '')) || 0;
                }
            });
            totalSubsidy += parseFloat(String(homeFields['UNCF Subsidy']?.rs || '').replace(/[^0-9.]/g, '')) || 0;
        }

        return {
            grossTotal,
            totalSubsidy,
            netPayable: grossTotal - totalSubsidy
        };
    };

    const { grossTotal: totalAmount, totalSubsidy: subsidy, netPayable: totalPayable } = calculateTotals();

    const generateHtml = () => {
        const generatedAt = new Date()
        const totalsCalculated = calculateTotals()
        const currentMonthName = billingMonthYear || `${generatedAt.toLocaleString('default', { month: 'long' })} - ${generatedAt.getFullYear()}`
        const accountHolder = 'Universal Elder Care'
        const upi = upiId || 'universaleldercare@upi'
        const upiUri = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(accountHolder)}&am=${totalPayable.toFixed(2)}&cu=INR&tn=MonthlyPatientInvoice`
        const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`
        const logoSrc = `${window.location.origin}/logo-uec.png`

        const isValid = (v: any) => {
            let val = v;
            if (typeof v === 'object' && v !== null) {
                val = v.price !== undefined ? v.price : v.rs;
            }
            if (val === null || val === undefined) return false;
            const str = String(val).trim().toLowerCase();
            if (str === '' || str === '0' || str === '00rs' || str === '0rs' || str === '00') return false;
            return true;
        }

        const renderRow = (desc: string, amount: any) => {
            if (!isValid(amount)) return '';
            let priceVal = amount;
            let subVal = 0;
            if (typeof amount === 'object' && amount !== null) {
                priceVal = amount.price !== undefined ? amount.price : amount.rs;
                subVal = amount.subsidy;
            }
            const price = parseFloat(String(priceVal)) || 0;
            const subsidy = parseFloat(String(subVal)) || 0;
            const payable = price - subsidy;
            return `
                <tr>
                    <td>${htmlEscape(desc)}</td>
                    <td class="text-right">Rs ${invoiceMoney(price)}</td>
                    <td class="text-right">Rs ${invoiceMoney(subsidy)}</td>
                    <td class="text-right">Rs ${invoiceMoney(payable)}</td>
                </tr>
            `;
        }

        const renderSection = (title: string, rowsHtml: string) => {
            if (!rowsHtml.trim()) return '';
            return `
                <tr class="section-header">
                    <td colspan="2">${htmlEscape(title)}</td>
                </tr>
                ${rowsHtml}
            `;
        }

        let elderRows = '';

        // BALANCE SUMMARY
        let balanceRows = '';
        balanceRows += renderRow('Balance Amount (Rs)', balances.amount)
        balanceRows += renderRow('Monthly Essentials Balance (Rs)', balances.monthlyEssentials)
        balanceRows += renderRow('Diapers Balance (Rs / No.)', balances.diapers)
        balanceRows += renderRow('Gloves Balance (Rs / No.)', balances.gloves)
        balanceRows += renderRow('Mask Balance (Rs / No.)', balances.mask)
        balanceRows += renderRow('Under Pad Balance (Rs / No.)', balances.underpad)
        if (balanceRows && billType === 'ELDER_CARE') {
            elderRows += renderSection('BALANCE SUMMARY (CARRIED FORWARD)', balanceRows)
        }


        // CORE
        let coreRows = '';
        coreRows += renderRow('Monthly Bed Charge', elderCore.monthlyBedCharge)
        // Balance Amount moved to balances section
        coreRows += renderRow('Room Sharing', elderCore.roomSharing)
        coreRows += renderRow('Bill Selection', elderCore.billSelection)
        coreRows += renderRow('Laundry', elderCore.laundry)
        coreRows += renderRow('EB', elderCore.eb)
        coreRows += renderRow('Hospital Visit', elderCore.hospitalVisit)
        coreRows += renderRow('Ambulance / Transport', elderCore.ambulance)
        coreRows += renderRow('Doctor Check up', elderCore.doctorCheckup)
        coreRows += renderRow('Physiotherapy', elderCore.physiotherapy)
        coreRows += renderRow('Counseling', elderCore.counseling)
        coreRows += renderRow('Occupational Therapy', elderCore.occupational)
        coreRows += renderRow('Speech Therapy', elderCore.speech)
        coreRows += renderRow('Nursing', elderCore.nursing)
        coreRows += renderRow('Caregiver Day', elderCore.caregiverDay)
        coreRows += renderRow('Caregiver Night', elderCore.caregiverNight)
        if (isValid(attender.price)) coreRows += renderRow(`Attender (${attender.shift || 'Shift'})`, attender.price)
        if (isValid(outsideAttender.price)) coreRows += renderRow(`Outside Attender (${outsideAttender.shift || 'Shift'})`, outsideAttender.price)
        coreRows += renderRow('Dressing', elderCore.dressing)
        coreRows += renderRow('First Aid', elderCore.firstAid)
        coreRows += renderRow('Special Care', elderCore.specialCare)
        coreRows += renderRow('Gas', elderCore.gas)
        elderRows += renderSection('CORE ITEMS & SERVICES', coreRows)

        // MEDICAL
        let medRows = '';
        const medVal = calcMedTotal('medicines');
        if (medVal > 100) medRows += renderRow(`Medicines/Tablets (Count: ${medical.medicines.count || 0} + 100 Base)`, medVal);

        ['diapers', 'gloves', 'mask', 'underpad', 'rubbersheet', 'readymade'].forEach((k) => {
            const item = medical[k as keyof typeof medical] as any;
            const val = calcMedTotal(k as keyof typeof medical);
            if (val > 0) {
                medRows += renderRow(`${k.charAt(0).toUpperCase() + k.slice(1)} (Qty: ${item.qty || 0}, Rate: ${item.rate} ${item.disposal ? '+ ' + item.disposal + ' disp' : ''})`, val);
            }
        });
        medRows += renderRow('Uro Bag', medical.uroBag.price)
        medRows += renderRow('Catheter', medical.catheter.price)
        medRows += renderRow('Lab Tests', medical.labTest.price)
        elderRows += renderSection('MEDICAL PRODUCTS', medRows)

        // FOOD
        let foodRows = '';
        foodRows += renderRow('Milk', food.milk)
        foodRows += renderRow('Juice', food.juice)
        foodRows += renderRow('Snacks', food.snacks)
        foodRows += renderRow('Herbal Drinks', food.herbalDrinks)
        elderRows += renderSection('FOOD CONSUMERS', foodRows)

        // CONSUMABLES
        let consRows = '';
        consRows += renderRow('New Dress', consumables.newDress)
        consRows += renderRow('Towel', consumables.towel)
        consRows += renderRow('Bedsheets', consumables.bedsheets)
        consRows += renderRow('Bedspread', consumables.bedspread)
        consRows += renderRow('New Dress Stitching', consumables.newDressStitching)
        consRows += renderRow('Old Dress Stitching', consumables.oldDressStitching)
        consRows += renderRow('All Out', consumables.allOut)
        consRows += renderRow('TV', consumables.tv)
        consRows += renderRow('Breakage', consumables.breakage)
        consRows += renderRow('Cleaning', consumables.cleaning)
        consRows += renderRow('Winding Up Charging', consumables.windingUp)
        consRows += renderRow('Beauty Services', consumables.beauty)
        consRows += renderRow('Monthly Essentials', consumables.monthlyEssentials)
        consRows += renderRow('Cylinder', consumables.cylinder)
        elderRows += renderSection('CONSUMABLES & SERVICES', consRows)

        // HOME CARE ROWS
        let homeRows = '';
        if (billType === 'HOME_CARE') {
            Object.keys(homeFields).forEach((key) => {
                if (key !== 'UNCF Subsidy') {
                    if (isValid(homeFields[key])) {
                        homeRows += renderRow(`${key} ${homeFields[key].qty ? '(Qty: ' + homeFields[key].qty + ')' : ''}`, homeFields[key])
                    }
                }
            })
        }

        const invoiceTableHtml = `
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th style="text-align: left;">Description</th>
                        <th style="text-align: right; width: 100px;">Actual Amount</th>
                        <th style="text-align: right; width: 100px;">UNCF Subsidy</th>
                        <th style="text-align: right; width: 100px;">Payable Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${billType === 'ELDER_CARE' ? elderRows : homeRows}
                </tbody>
            </table>
        `

        let paymentInfoHtml = ''
        if (isValid(paymentInfo.doneDate) || isValid(paymentInfo.mode) || isValid(paymentInfo.bankName)) {
            paymentInfoHtml = `
                <div class="bold mt-4" style="font-size: 14px;">PAYMENT INFORMATION</div>
                <table class="payment-table mt-2">
                    <tbody>
                        <tr>
                            <td><strong>Payment Done Date:</strong> ${htmlEscape(paymentInfo.doneDate || '-')}</td>
                            <td><strong>Material Received Date:</strong> ${htmlEscape(paymentInfo.receivedDate || '-')}</td>
                        </tr>
                        <tr>
                            <td><strong>Payment Mode:</strong> ${htmlEscape(paymentInfo.mode || '-')}</td>
                            <td><strong>Material Receiving Mode:</strong> ${htmlEscape(paymentInfo.receivingMode || '-')}</td>
                        </tr>
                        <tr>
                            <td><strong>Bank Name:</strong> ${htmlEscape(paymentInfo.bankName || '-')}</td>
                            <td><strong>Gpay Number:</strong> ${htmlEscape(paymentInfo.gpay || '-')}</td>
                        </tr>
                        ${isValid(paymentInfo.balanceAmount) ? `
                            <tr>
                                <td><strong>Balance Amount:</strong> Rs ${htmlEscape(paymentInfo.balanceAmount)}</td>
                                <td><strong>Balance Item:</strong> ${htmlEscape(paymentInfo.balanceItem || '-')}</td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            `
        }

        return `<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Patient Service Bill - ${htmlEscape(patientName)}</title>
    <style>
        @page { size: A4; margin: 16mm; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #fff; color: #172033; font-family: "Times New Roman", Times, serif; font-size: 11px; }
        .sheet { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 22px; }
        
        .header { display: grid; grid-template-columns: 1fr auto; gap: 20px; border-bottom: 2px solid #0f766e; padding-bottom: 16px; }
        .brand { display: flex; gap: 14px; align-items: center; }
        .logo { width: 58px; height: 58px; object-fit: contain; }
        h1 { margin: 0; font-size: 18px; color: #0f2f3f; }
        .muted { color: #64748b; line-height: 1.45; }
        .title { text-align: right; }
        .title h2 { margin: 0; font-size: 16px; color: #0f766e; }
        .badge { display: inline-block; margin-top: 8px; border-radius: 999px; padding: 5px 12px; background: #ecfdf5; color: #047857; font-weight: 800; text-transform: uppercase; font-size: 10px; }
        
        .panel { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px; }
        .box { border: 1px solid #dbe5ef; border-radius: 6px; padding: 14px; background: #fafcff; }
        .box h3 { margin: 0 0 10px; color: #334155; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; }
        
        .patient-table { width: 100%; border-collapse: collapse; }
        .patient-table td { padding: 4px 0; font-size: 11px; }
        .patient-table td:first-child { width: 110px; color: #64748b; font-weight: bold; }
        .patient-table td:last-child { font-weight: bold; color: #111827; }

        .invoice-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        .invoice-table th, .invoice-table td { padding: 8px 12px; border: 1px solid #dbe5ef; font-size: 11px; }
        .invoice-table th { background: #f8fafc; font-weight: bold; color: #334155; border-bottom: 2px solid #94a3b8; }
        .invoice-table tr.section-header td { background: #f1f5f9; font-weight: bold; color: #0f766e; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
        
        .totals-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .totals-table td { padding: 6px 12px; border: 1px solid #dbe5ef; font-size: 12px; }
        .totals-table tr.grand-total td { background: #ecfdf5; font-weight: bold; color: #065f46; border-color: #059669; font-size: 14px; }
        
        .payment-table { width: 100%; border-collapse: collapse; }
        .payment-table td { padding: 6px 12px; border: 1px solid #dbe5ef; font-size: 11px; background: #fafcff; }

        .payment-total { display: grid; grid-template-columns: 1fr 220px; gap: 18px; align-items: stretch; margin-top: 18px; }
        .qr { text-align: center; border: 1px solid #dbe5ef; border-radius: 6px; padding: 12px; }
        .qr img { width: 180px; height: 180px; object-fit: contain; }
        
        .footer { display: grid; grid-template-columns: 1fr 220px; gap: 18px; margin-top: 24px; border-top: 1px solid #dbe5ef; padding-top: 16px; font-size: 10px; }
        .signature { height: 72px; border-bottom: 1px solid #94a3b8; display: flex; align-items: end; justify-content: center; color: #64748b; font-weight: 700; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .mt-2 { margin-top: 8px; }
        .mt-4 { margin-top: 16px; }
        .mb-4 { margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="sheet">
        <div class="header" style="grid-template-columns: auto 1fr; align-items: center;">
            <div class="brand">
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <img class="logo" style="width: 200px; height: auto;" src="${htmlEscape(logoSrc)}" />
                    <strong style="font-size: 13px; margin-top: 8px; color: #64748b;">(A Unit Of UNCF)</strong>
                </div>
            </div>
            <div class="title">
                <h2>${billType === 'ELDER_CARE' ? 'Elder Care Patient Service Bill' : 'Home Care Patient Service Bill'}</h2>
            </div>
        </div>

        <div class="panel">
            <div class="box">
                <h3>Patient Details</h3>
                <table class="patient-table">
                    <tbody>
                        ${patientName ? `<tr><td>Patient Name</td><td>${htmlEscape(patientName)}</td></tr>` : ''}
                        ${patientAge ? `<tr><td>Age</td><td>${htmlEscape(patientAge)}</td></tr>` : ''}
                        ${patientSex ? `<tr><td>Sex</td><td>${htmlEscape(patientSex)}</td></tr>` : ''}
                        ${patientDob ? `<tr><td>DOB</td><td>${htmlEscape(patientDob)}</td></tr>` : ''}
                        ${patientId ? `<tr><td>Patient ID</td><td>${htmlEscape(patientId)}</td></tr>` : ''}
                        <tr><td>Service Type</td><td>${htmlEscape(billType.replace('_', ' '))}</td></tr>
                    </tbody>
                </table>
            </div>
            <div class="box">
                <h3>Guardian Details</h3>
                <table class="patient-table">
                    <tbody>
                        ${billId ? `<tr><td>Bill ID</td><td>${htmlEscape(billId)}</td></tr>` : ''}
                        <tr><td>Bill Date</td><td>${htmlEscape(generatedAt.toLocaleDateString())}</td></tr>
                        ${guardianName ? `<tr><td>Guardian Name</td><td>${htmlEscape(guardianName)}</td></tr>` : ''}
                        ${guardianContact ? `<tr><td>Contact Number</td><td>${htmlEscape(guardianContact)}</td></tr>` : ''}
                        ${guardianAddress ? `<tr><td>Address</td><td>${htmlEscape(guardianAddress)}</td></tr>` : ''}
                        <tr><td>Billing Month</td><td>${htmlEscape(currentMonthName)}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>



        ${invoiceTableHtml}

        <table class="totals-table">
            <tbody>
                ${isValid(totals.lateFee) ? `<tr><td><strong>Late Fee Amount</strong></td><td class="text-right">Rs ${htmlEscape(totals.lateFee)}</td></tr>` : ''}
                ${isValid(totals.lateMaterialFee) ? `<tr><td><strong>Late Materials Fee</strong></td><td class="text-right">Rs ${htmlEscape(totals.lateMaterialFee)}</td></tr>` : ''}
                ${isValid(totals.totalReversibleItems) ? `<tr><td><strong>Total Reversible Items</strong></td><td class="text-right">Rs ${htmlEscape(totals.totalReversibleItems)}</td></tr>` : ''}
                ${isValid(totals.uncfSubsidiaryItems) ? `<tr><td colspan="2"><strong>UNCF Subsidiary Items:</strong> ${htmlEscape(totals.uncfSubsidiaryItems)}</td></tr>` : ''}
                
                <tr>
                    <td><strong>Gross Total Amount</strong></td>
                    <td class="text-right"><strong>Rs ${htmlEscape(invoiceMoney(totalsCalculated.grossTotal))}</strong></td>
                </tr>
                <tr>
                    <td style="color: #ea580c;"><strong>UNCF Subsidy Amount</strong></td>
                    <td class="text-right" style="color: #ea580c;"><strong>- Rs ${htmlEscape(invoiceMoney(totalsCalculated.totalSubsidy))}</strong></td>
                </tr>
                <tr class="grand-total">
                    <td>Total Payable Amount</td>
                    <td class="text-right">Rs ${htmlEscape(invoiceMoney(totalsCalculated.netPayable))}</td>
                </tr>
            </tbody>
        </table>

        ${paymentInfoHtml}

        <div class="mt-4" style="font-size: 14px; line-height: 1.5;">
            <div class="bold italic" style="font-size: 16px;">Feedbacks and issues:</div>
            <div class="mt-1">Please write letter (post or direct letter to UEC) and mail <span class="bold">universaleldercare2010@gmail.com</span>.<br/>Please follow up with us, within one or two weeks issues or queries are cleared.</div>
            <div class="mt-2 mb-2 italic" style="font-size: 14px">It will be kind enough if we receive the payments within "5th of every month", it will be supportive to get the materials.<br/>After 7th of every month, late payment will be collected.</div>
            
            <div class="bold mt-3" style="color: #b91c1c; font-size: 14px;">IF PAYMENT RECEIPT HAVEN'T SENT TO THE SAME NUMBER, IT WON'T BE ACCOUNTABLE.<br/>THE AMOUNT WILL BE ADDED IN NEXT MONTH BILL.</div>
            <div class="bold mt-1" style="color: #b91c1c; font-size: 14px;">பணம் செலுத்தும் ரசீது இந்த எண்ணுக்கு அனுப்பப்படாவிட்டால், அது கணக்கிடப்படாது,<br/>அடுத்த மாத கணக்கில் தொகை சேர்க்கப்படும்.</div>
        </div>

        <div class="payment-total">
            <div>
                <div class="bold">Payment facilities:</div>
                <div>Net banking or <span class="bold">UPI Google pay, PhonePe</span></div>
                <div class="bold mt-2">After payment kindly send:</div>
                <div style="margin-left: 12px;">
                    1) transfer id<br/>
                    2) screenshot of payment<br/>
                    3) transferred date<br/>
                    4) transferred amount
                </div>
            </div>
            <div class="qr">
                <img src="${htmlEscape(qrSrc)}" />
                <div class="bold mt-2">UPI QR Code</div>
                <div style="font-size: 10px; color: #64748b;">${htmlEscape(upi)}</div>
            </div>
        </div>

        <div class="footer" style="display: block; text-align: center; margin-top: 40px; color: #64748b; font-size: 12px; font-style: italic; border-top: 1px solid #dbe5ef; padding-top: 16px;">
            This is a system generated bill.
        </div>
    </div>
    <script>window.onload = () => { window.print(); }</script>
</body>
</html>`
    }

    const openPreview = () => {
        const win = window.open('', '_blank')
        if (win) {
            win.document.write(generateHtml())
            win.document.close()
        }
    }

    const openWhatsApp = async () => {
        if (!guardianContact) {
            alert('Please enter a Guardian Contact number before sending.');
            return;
        }

        setIsSending(true);
        try {
            const message = [
                `Dear ${guardianName || 'Family'},`,
                '',
                `Please find the ${billType === 'ELDER_CARE' ? 'Elder Care' : 'Home Care'} bill for ${patientName || 'the patient'} for ${billingMonthYear || 'this month'}.`,
                '',
                `Amount Due: ${invoiceMoney(totalPayable)}`,
                '',
                `*(Please see the attached PDF invoice for the detailed breakdown)*`,
                '',
                'Regards,',
                'Universal Elder Care'
            ].join('\n');

            // Create temporary container for PDF generation
            const element = document.createElement('div');
            element.innerHTML = generateHtml();

            // html2pdf options
            const opt: any = {
                margin: 16,
                filename: 'Patient_Bill.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Generate blob
            const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

            // Download PDF automatically
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Patient_Bill.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            // Open WhatsApp Web with text
            const target = guardianContact ? `https://wa.me/${guardianContact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(target, '_blank', 'noopener,noreferrer');

        } catch (error: any) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF. ' + error.message);
        } finally {
            setIsSending(false);
        }
    }

    const ShiftOptions = ['Partial', 'Full', 'Day', 'Night', 'Full time']

    return (
        <div className="flex h-full flex-col">
            <PageHeader title="Manual Billing Generator" subtitle="Generate instant PDF invoices with dynamic structures." breadcrumbs={[{ label: 'Finance' }, { label: 'Manual Billing' }]} />

            <div className="flex-1 overflow-auto bg-slate-50 p-6">
                <div className="mx-auto max-w-6xl space-y-6">

                    {/* Mode Toggle */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex gap-4 border-b border-slate-200 pb-4">
                            <button
                                onClick={() => setBillType('ELDER_CARE')}
                                className={`rounded-lg px-4 py-2 font-bold ${billType === 'ELDER_CARE' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                            >
                                Elder Care Bill
                            </button>
                            <button
                                onClick={() => setBillType('HOME_CARE')}
                                className={`rounded-lg px-4 py-2 font-bold ${billType === 'HOME_CARE' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                            >
                                Home Care Bill
                            </button>
                        </div>

                        {/* Patient & Guardian Info */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2">Patient Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2"><Field label="Patient Name (with Initials)" value={patientName} onChange={setPatientName} /></div>
                                    <Field label="Age" placeholder="e.g. 75" value={patientAge} onChange={setPatientAge} />
                                    <Select label="Sex" value={patientSex} onChange={setPatientSex} options={['Male', 'Female', 'Other']} />
                                    <Field label="DOB" placeholder="DD-MM-YYYY" value={patientDob} onChange={setPatientDob} />
                                    <Field label="Patient ID" value={patientId} onChange={setPatientId} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2">Guardian Details & Bill Info</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Guardian Name" value={guardianName} onChange={setGuardianName} />
                                    <Field label="Guardian Contact" value={guardianContact} onChange={setGuardianContact} />
                                    <div className="col-span-2"><Field label="Guardian Address" value={guardianAddress} onChange={setGuardianAddress} /></div>
                                    <Field label="Bill ID" value={billId} onChange={setBillId} />
                                    <Field label="Billing Month & Year" placeholder="August - 2026" value={billingMonthYear} onChange={setBillingMonthYear} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-6">
                            <Field label="UPI ID for Payment QR" value={upiId} onChange={setUpiId} placeholder="universaleldercare@upi" />
                        </div>
                    </div>

                    {billType === 'ELDER_CARE' && (
                        <div className="space-y-6">
                            {/* Core Items */}
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2 mb-4">Core Items & Services</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <Select label="Room Sharing" value={elderCore.roomSharing} onChange={(v: string) => setElderCore({ ...elderCore, roomSharing: v })} options={['Single', 'Two Sharing', 'Four Sharing']} />
                                    <Select label="Bill Selection" value={elderCore.billSelection} onChange={(v: string) => setElderCore({ ...elderCore, billSelection: v })} options={['30 Days', 'Daily']} />
                                    <SubsidyField label="Monthly Bed Charge" priceObj={elderCore.monthlyBedCharge} onChange={(v: any) => setElderCore({ ...elderCore, monthlyBedCharge: v })} />
                                    
                                    {/* Shifts */}
                                    <div className="col-span-2 grid grid-cols-2 gap-2 border p-2 rounded-lg bg-slate-50">
                                        <Select label="Attender Shift" value={attender.shift} onChange={(v: string) => setAttender({ ...attender, shift: v })} options={ShiftOptions} />
                                        <Field label="Attender Price" value={attender.price} onChange={(v: string) => setAttender({ ...attender, price: v })} />
                                    </div>
                                    <div className="col-span-2 grid grid-cols-2 gap-2 border p-2 rounded-lg bg-slate-50">
                                        <Select label="Outside Attender Shift" value={outsideAttender.shift} onChange={(v: string) => setOutsideAttender({ ...outsideAttender, shift: v })} options={ShiftOptions} />
                                        <Field label="Outside Price" value={outsideAttender.price} onChange={(v: string) => setOutsideAttender({ ...outsideAttender, price: v })} />
                                    </div>

                                    <SubsidyField label="Laundry" priceObj={elderCore.laundry} onChange={(v: any) => setElderCore({ ...elderCore, laundry: v })} />
                                    <SubsidyField label="Eb" priceObj={elderCore.eb} onChange={(v: any) => setElderCore({ ...elderCore, eb: v })} />
                                    <SubsidyField label="Hospital Visit" priceObj={elderCore.hospitalVisit} onChange={(v: any) => setElderCore({ ...elderCore, hospitalVisit: v })} />
                                    <SubsidyField label="Ambulance" priceObj={elderCore.ambulance} onChange={(v: any) => setElderCore({ ...elderCore, ambulance: v })} />
                                    <SubsidyField label="Doctor Checkup" priceObj={elderCore.doctorCheckup} onChange={(v: any) => setElderCore({ ...elderCore, doctorCheckup: v })} />
                                    <SubsidyField label="Physiotherapy" priceObj={elderCore.physiotherapy} onChange={(v: any) => setElderCore({ ...elderCore, physiotherapy: v })} />
                                    <SubsidyField label="Counseling" priceObj={elderCore.counseling} onChange={(v: any) => setElderCore({ ...elderCore, counseling: v })} />
                                    <SubsidyField label="Occupational Therapy" priceObj={elderCore.occupational} onChange={(v: any) => setElderCore({ ...elderCore, occupational: v })} />
                                    <SubsidyField label="Speech Therapy" priceObj={elderCore.speech} onChange={(v: any) => setElderCore({ ...elderCore, speech: v })} />
                                    <SubsidyField label="Nursing" priceObj={elderCore.nursing} onChange={(v: any) => setElderCore({ ...elderCore, nursing: v })} />
                                    <SubsidyField label="Caregiver Day" priceObj={elderCore.caregiverDay} onChange={(v: any) => setElderCore({ ...elderCore, caregiverDay: v })} />
                                    <SubsidyField label="Caregiver Night" priceObj={elderCore.caregiverNight} onChange={(v: any) => setElderCore({ ...elderCore, caregiverNight: v })} />
                                    <SubsidyField label="Dressing" priceObj={elderCore.dressing} onChange={(v: any) => setElderCore({ ...elderCore, dressing: v })} />
                                    <SubsidyField label="First Aid" priceObj={elderCore.firstAid} onChange={(v: any) => setElderCore({ ...elderCore, firstAid: v })} />
                                    <SubsidyField label="Special Care" priceObj={elderCore.specialCare} onChange={(v: any) => setElderCore({ ...elderCore, specialCare: v })} />
                                    <SubsidyField label="Gas" priceObj={elderCore.gas} onChange={(v: any) => setElderCore({ ...elderCore, gas: v })} />
                                </div>
                            </div>

                            {/* Medical Products */}
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2 mb-4">Medical Products</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid grid-cols-2 gap-2 border p-2 rounded-lg bg-slate-50">
                                        <SubsidyField label="Medicines Count (Rs)" priceObj={medical.medicines.count} onChange={(v: any) => setMedical({ ...medical, medicines: { ...medical.medicines, count: v } })} />
                                        <Field label="Base (+100rs)" value={medical.medicines.baseAmount} onChange={(v: string) => setMedical({ ...medical, medicines: { ...medical.medicines, baseAmount: v } })} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-slate-50">
                                        <Field label="Diapers (Qty)" value={medical.diapers.qty} onChange={(v: string) => setMedical({ ...medical, diapers: { ...medical.diapers, qty: v } })} />
                                        <Field label="Rate (70)" value={medical.diapers.rate} onChange={(v: string) => setMedical({ ...medical, diapers: { ...medical.diapers, rate: v } })} />
                                        <Field label="Disposal Chg" value={medical.diapers.disposal} onChange={(v: string) => setMedical({ ...medical, diapers: { ...medical.diapers, disposal: v } })} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-slate-50">
                                        <Field label="Gloves (Qty)" value={medical.gloves.qty} onChange={(v: string) => setMedical({ ...medical, gloves: { ...medical.gloves, qty: v } })} />
                                        <Field label="Rate (75)" value={medical.gloves.rate} onChange={(v: string) => setMedical({ ...medical, gloves: { ...medical.gloves, rate: v } })} />
                                        <Field label="Disposal Chg" value={medical.gloves.disposal} onChange={(v: string) => setMedical({ ...medical, gloves: { ...medical.gloves, disposal: v } })} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-slate-50">
                                        <Field label="Mask (Qty)" value={medical.mask.qty} onChange={(v: string) => setMedical({ ...medical, mask: { ...medical.mask, qty: v } })} />
                                        <Field label="Rate (4)" value={medical.mask.rate} onChange={(v: string) => setMedical({ ...medical, mask: { ...medical.mask, rate: v } })} />
                                        <Field label="Disposal Chg" value={medical.mask.disposal} onChange={(v: string) => setMedical({ ...medical, mask: { ...medical.mask, disposal: v } })} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-slate-50">
                                        <Field label="Underpad (Qty)" value={medical.underpad.qty} onChange={(v: string) => setMedical({ ...medical, underpad: { ...medical.underpad, qty: v } })} />
                                        <Field label="Rate (60)" value={medical.underpad.rate} onChange={(v: string) => setMedical({ ...medical, underpad: { ...medical.underpad, rate: v } })} />
                                        <Field label="Disposal Chg" value={medical.underpad.disposal} onChange={(v: string) => setMedical({ ...medical, underpad: { ...medical.underpad, disposal: v } })} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-slate-50">
                                        <Field label="RubberSheet (m)" value={medical.rubbersheet.qty} onChange={(v: string) => setMedical({ ...medical, rubbersheet: { ...medical.rubbersheet, qty: v } })} />
                                        <Field label="Rate (700)" value={medical.rubbersheet.rate} onChange={(v: string) => setMedical({ ...medical, rubbersheet: { ...medical.rubbersheet, rate: v } })} />
                                        <Field label="Disposal Chg" value={medical.rubbersheet.disposal} onChange={(v: string) => setMedical({ ...medical, rubbersheet: { ...medical.rubbersheet, disposal: v } })} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-slate-50">
                                        <Field label="Readymade" value={medical.readymade.qty} onChange={(v: string) => setMedical({ ...medical, readymade: { ...medical.readymade, qty: v } })} />
                                        <Field label="Rate (1500)" value={medical.readymade.rate} onChange={(v: string) => setMedical({ ...medical, readymade: { ...medical.readymade, rate: v } })} />
                                        <Field label="Disposal Chg" value={medical.readymade.disposal} onChange={(v: string) => setMedical({ ...medical, readymade: { ...medical.readymade, disposal: v } })} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <Field label="Uro Bag Price" value={medical.uroBag.price} onChange={(v: string) => setMedical({ ...medical, uroBag: { ...medical.uroBag, price: v } })} />
                                        <Field label="Catheter Price" value={medical.catheter.price} onChange={(v: string) => setMedical({ ...medical, catheter: { ...medical.catheter, price: v } })} />
                                        <Field label="Lab Test Price" value={medical.labTest.price} onChange={(v: string) => setMedical({ ...medical, labTest: { ...medical.labTest, price: v } })} />
                                    </div>
                                </div>
                            </div>

                            {/* Food & Consumables */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2 mb-4">Food Consumers</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SubsidyField label="Milk" priceObj={food.milk} onChange={(v: any) => setFood({ ...food, milk: v })} />
                                        <SubsidyField label="Juice" priceObj={food.juice} onChange={(v: any) => setFood({ ...food, juice: v })} />
                                        <SubsidyField label="Snacks" priceObj={food.snacks} onChange={(v: any) => setFood({ ...food, snacks: v })} />
                                        <SubsidyField label="Herbal Drinks" priceObj={food.herbalDrinks} onChange={(v: any) => setFood({ ...food, herbalDrinks: v })} />
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2 mb-4">Consumables & Services</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <SubsidyField label="New Dress" priceObj={consumables.newDress} onChange={(v: any) => setConsumables({ ...consumables, newDress: v })} />
                                        <SubsidyField label="Towel" priceObj={consumables.towel} onChange={(v: any) => setConsumables({ ...consumables, towel: v })} />
                                        <SubsidyField label="Bedsheets" priceObj={consumables.bedsheets} onChange={(v: any) => setConsumables({ ...consumables, bedsheets: v })} />
                                        <SubsidyField label="Bedspread" priceObj={consumables.bedspread} onChange={(v: any) => setConsumables({ ...consumables, bedspread: v })} />
                                        <SubsidyField label="New Stitching" priceObj={consumables.newDressStitching} onChange={(v: any) => setConsumables({ ...consumables, newDressStitching: v })} />
                                        <SubsidyField label="Old Stitching" priceObj={consumables.oldDressStitching} onChange={(v: any) => setConsumables({ ...consumables, oldDressStitching: v })} />
                                        <SubsidyField label="All Out" priceObj={consumables.allOut} onChange={(v: any) => setConsumables({ ...consumables, allOut: v })} />
                                        <SubsidyField label="TV" priceObj={consumables.tv} onChange={(v: any) => setConsumables({ ...consumables, tv: v })} />
                                        <SubsidyField label="Breakage" priceObj={consumables.breakage} onChange={(v: any) => setConsumables({ ...consumables, breakage: v })} />
                                        <SubsidyField label="Cleaning" priceObj={consumables.cleaning} onChange={(v: any) => setConsumables({ ...consumables, cleaning: v })} />
                                        <SubsidyField label="Winding Up" priceObj={consumables.windingUp} onChange={(v: any) => setConsumables({ ...consumables, windingUp: v })} />
                                        <SubsidyField label="Beauty Services" priceObj={consumables.beauty} onChange={(v: any) => setConsumables({ ...consumables, beauty: v })} />
                                        <SubsidyField label="Monthly Essentials" priceObj={consumables.monthlyEssentials} onChange={(v: any) => setConsumables({ ...consumables, monthlyEssentials: v })} />
                                        <SubsidyField label="Cylinder" priceObj={consumables.cylinder} onChange={(v: any) => setConsumables({ ...consumables, cylinder: v })} />
                                    </div>
                                </div>
                            </div>

                            {/* Totals & Payment Info */}
                            
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2 mb-4">Balance Summary (Carried Forward)</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <SubsidyField label="Balance Amount" priceObj={balances.amount} onChange={(v: any) => setBalances({ ...balances, amount: v })} />
                                    <SubsidyField label="Monthly Essentials Bal." priceObj={balances.monthlyEssentials} onChange={(v: any) => setBalances({ ...balances, monthlyEssentials: v })} />
                                    <SubsidyField label="Diapers Bal. (Rs/No)" priceObj={balances.diapers} onChange={(v: any) => setBalances({ ...balances, diapers: v })} />
                                    <SubsidyField label="Gloves Bal. (Rs/No)" priceObj={balances.gloves} onChange={(v: any) => setBalances({ ...balances, gloves: v })} />
                                    <SubsidyField label="Mask Bal. (Rs/No)" priceObj={balances.mask} onChange={(v: any) => setBalances({ ...balances, mask: v })} />
                                    <SubsidyField label="Under Pad Bal. (Rs/No)" priceObj={balances.underpad} onChange={(v: any) => setBalances({ ...balances, underpad: v })} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b pb-2 mb-4">Payment & Fees</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <Field label="Late Fee Amount" value={totals.lateFee} onChange={(v: string) => setTotals({ ...totals, lateFee: v })} />
                                    <Field label="Late Materials Fee" value={totals.lateMaterialFee} onChange={(v: string) => setTotals({ ...totals, lateMaterialFee: v })} />
                                    <Field label="UNCF Subsidy Amount" value={totals.uncfSubsidyAmount} onChange={(v: string) => setTotals({ ...totals, uncfSubsidyAmount: v })} />
                                    <Field label="UNCF Subsidiary Items" value={totals.uncfSubsidiaryItems} onChange={(v: string) => setTotals({ ...totals, uncfSubsidiaryItems: v })} />
                                    <Field label="Total Reversible Items" value={totals.totalReversibleItems} onChange={(v: string) => setTotals({ ...totals, totalReversibleItems: v })} />
                                    <div className="col-span-3"></div>

                                    <Field label="Payment Done Date" type="date" value={paymentInfo.doneDate} onChange={(v: string) => setPaymentInfo({ ...paymentInfo, doneDate: v })} />
                                    <Field label="Material Received Date" type="date" value={paymentInfo.receivedDate} onChange={(v: string) => setPaymentInfo({ ...paymentInfo, receivedDate: v })} />
                                    <Select label="Payment Mode" value={paymentInfo.mode} onChange={(v: string) => setPaymentInfo({ ...paymentInfo, mode: v })} options={['Cash', 'UPI', 'Card']} />
                                    <Select label="Receiving Mode" value={paymentInfo.receivingMode} onChange={(v: string) => setPaymentInfo({ ...paymentInfo, receivingMode: v })} options={['Courier', 'Direct']} />
                                    <Field label="Bank Name" value={paymentInfo.bankName} onChange={(v: string) => setPaymentInfo({ ...paymentInfo, bankName: v })} />
                                    <Field label="Gpay Phone Number" value={paymentInfo.gpay} onChange={(v: string) => setPaymentInfo({ ...paymentInfo, gpay: v })} />
                                    <Field label="Balance Amount" value={paymentInfo.balanceAmount} onChange={(v: string) => setPaymentInfo({ ...paymentInfo, balanceAmount: v })} />
                                    <Field label="Balance Item" value={paymentInfo.balanceItem} onChange={(v: string) => setPaymentInfo({ ...paymentInfo, balanceItem: v })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {billType === 'HOME_CARE' && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-lg font-bold text-slate-800">Home Care Line Items</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {Object.keys(homeFields).map((key) => {
                                    const hasQty = homeFields[key].qty !== undefined
                                    return (
                                        <div key={key} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">{key}</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Amount (Rs)"
                                                    value={homeFields[key].rs}
                                                    onChange={(e) => {
                                                        setHomeFields(prev => ({
                                                            ...prev,
                                                            [key]: { ...prev[key], rs: e.target.value }
                                                        }))
                                                    }}
                                                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-primary-500"
                                                />
                                                {hasQty && (
                                                    <input
                                                        type="text"
                                                        placeholder="Qty (No)"
                                                        value={homeFields[key].qty}
                                                        onChange={(e) => {
                                                            setHomeFields(prev => ({
                                                                ...prev,
                                                                [key]: { ...prev[key], qty: e.target.value }
                                                            }))
                                                        }}
                                                        className="h-10 w-24 rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-primary-500"
                                                    />
                                                )}
                                                <input
                                                    type="number"
                                                    placeholder="Subsidy (₹)"
                                                    value={homeFields[key].subsidy || ''}
                                                    onChange={(e) => {
                                                        setHomeFields(prev => ({
                                                            ...prev,
                                                            [key]: { ...prev[key], subsidy: e.target.value }
                                                        }))
                                                    }}
                                                    className="h-10 w-32 rounded-md border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700 outline-none focus:border-orange-500 placeholder:text-orange-300"
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-10">
                <div className="flex items-center gap-6">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Amount</div>
                        <div className="text-xl font-bold text-slate-900">{invoiceMoney(totalAmount)}</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">UNCF Subsidy</div>
                        <div className="text-xl font-bold text-red-600">- {invoiceMoney(subsidy)}</div>
                    </div>
                    <div className="border-l border-slate-200 pl-6">
                        <div className="text-xs font-bold uppercase tracking-wider text-primary-600">Total Payable</div>
                        <div className="text-2xl font-black text-primary-700">{invoiceMoney(totalPayable)}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openPreview}
                        className="flex h-11 items-center gap-2 rounded-lg bg-slate-100 px-5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                    >
                        <FileText className="h-4 w-4" />
                        Generate PDF
                    </button>
                    <button
                        onClick={openWhatsApp}
                        disabled={isSending}
                        className={`flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-bold text-white ${isSending ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#1DA851]'}`}
                    >
                        {isSending ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </span>
                        ) : (
                            <><Smartphone className="h-4 w-4" /> Send via WhatsApp</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
