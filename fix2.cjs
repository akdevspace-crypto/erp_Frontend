const fs = require('fs');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('src/features/nursing_care/hooks/useNursingCare.ts', [
    ['addToast', 'toast']
]);

let medContent = fs.readFileSync('src/features/nursing_care/pages/MedicationSchedule.tsx', 'utf8');
medContent = medContent.replace(/cell: \(row: any\) =>/g, "key: 'col', cell: (row: any) =>");
medContent = medContent.replace(/action=\{/g, "actions={");
medContent = medContent.replace(/icon=\{CalendarClock\}/g, "");
medContent = medContent.replace(/loadingAdmissions/g, "loadingAdms");
fs.writeFileSync('src/features/nursing_care/pages/MedicationSchedule.tsx', medContent);

let vitContent = fs.readFileSync('src/features/nursing_care/pages/Vitals.tsx', 'utf8');
vitContent = vitContent.replace(/cell: \(row: any\) =>/g, "key: 'col', cell: (row: any) =>");
vitContent = vitContent.replace(/action=\{/g, "actions={");
vitContent = vitContent.replace(/icon=\{Activity\}/g, "");
vitContent = vitContent.replace(/loadingAdmissions/g, "loadingAdms");
fs.writeFileSync('src/features/nursing_care/pages/Vitals.tsx', vitContent);

replaceInFile('src/features/patient_billing/pages/PatientManualBilling.tsx', [
    ['image: { type: \'jpeg\', quality: 0.98 }', 'image: { type: \'jpeg\' as const, quality: 0.98 }']
]);

replaceInFile('src/features/patient_portal/pages/PatientDashboard.tsx', [
    ['AlertCircle, ', '']
]);

replaceInFile('src/features/patient_portal/pages/PatientPortalLayout.tsx', [
    ['User, ', '']
]);

replaceInFile('src/pages/OrganizationDashboard.tsx', [
    ['ProjectManagement ? <ProjectManagement /> :', ''],
    ['import { ProjectTable } from \'../features/uncf_donations/components/ProjectTable\';', '']
]);
