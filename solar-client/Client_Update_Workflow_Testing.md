# Complete HRMS & Admin Workflow & Testing Guide

This document outlines the step-by-step workflow and testing instructions for the newly implemented and updated modules within the HRMS ERP system. Please follow the individual testing steps to verify each feature works as specified.

---

## 1. Temporary Incharge Setting & Notice Period
**Feature Overview:** The admin can assign, view, and edit a temporary incharge for an employee. Added "Notice Period" tracking functionality.

### Workflow:
1. Navigate to **HRMS Settings** -> **Temporary Incharge Setting**.
2. Locate the "Employee List" table.
3. If an employee already has a Temporary Incharge assigned, an **"Edit"** button will appear next to the "Assign" button in the Action column.
4. If no incharge is assigned, only the **"Assign"** button is visible.
5. In the same view (or corresponding forms), the Admin can manage the **Notice Period** days for the resigning/departing employee.

### Testing Steps:
- [ ] Verify that the standard **Assign** button functions correctly for an employee without a temp incharge.
- [ ] Assign a temp incharge. Observe the row updates, and the **Edit** button appears dynamically.
- [ ] Click the **Edit** button to load the configuration form, switch the assigned person, and save. Verify the database and UI update immediately.
- [ ] Verify the **Notice Period** column accurately displays the required days set by the admin.

---

## 2. Resign Approvals Module (Manual Admin Entry)
**Feature Overview:** The system now handles resignation tracking dynamically, including automatic date calculation (Resignation Date + Notice Period = Last Working Date) and real-time synchronization with dashboards.

### Workflow:
1. Navigate to **HR Settings** -> **Resign Approvals**.
2. Click **Create Resignation Request**.
3. Select an **Employee Name** from the dropdown list.
4. Input the **Resignation Date** and specify the **Notice Period (Days)**.
5. The system will auto-calculate and lock the **Last Working Date**.
6. Provide the **Reason for Resignation**.
7. Submit the form to officially record the resignation status.

### Testing Steps:
- [ ] Open the Resignation form and select an employee.
- [ ] Pick a random Resignation Date and input a number in "Notice Period (Days)".
- [ ] **Verify** that the "Last Working Date" input field automatically populates with the correct exact future date and *cannot* be manually manipulated by the admin.
- [ ] Submit the request and verify it saves.
- [ ] Navigate to the Resign Approvals Table and verify the record reflects properly in real-time.

---

## 3. HRMS Settings (Payroll & Recruitment Work Configurations)
**Feature Overview:** The Payroll structure has been modularized to react dynamically to Payroll Types. Training options now display user-friendly module categories.

### Workflow:
1. Navigate to **HRMS Settings** -> **HRMS Settings** (Section 1: Payroll & Work Configuration).
2. Use the **Payroll Type** Dropdown. Select `Hybrid`.
3. A sub-dropdown called **"Hybrid Base Type"** will appear (Monthly / Hourly).
4. Notice the **"Salary Range"** title changes to reflect the selected types (e.g., "Monthly Hybrid Salary Range").
5. Scroll down to Section 2 (Recruitment Settings).
6. Under **"Training Modules Required"**, check the boxes for customized Candidate Training Categories instead of titles (e.g., Solar Rooftop, Solar Pump, Street Light).

### Testing Steps:
- [ ] Change the "Payroll Type" to `Monthly`, `Hourly`, `Commission Based`, and `Hybrid`.
- [ ] **Verify** the Salary Input Title properly transforms dynamically (e.g. from "Monthly Salary Range" to "Hover/Commission Based").
- [ ] Select `Hybrid` and **Verify** the "Hybrid Base Type" sub-dropdown renders successfully.
- [ ] Go to Section 2 and interact with the **Training Modules Required** checkboxes. Ensure that checking/unchecking boxes correctly highlights them and saves properly.
- [ ] Verify that opening an existing configuration loads your checked choices accurately from the database.

---

## 4. Leave Approvals (Automated Logic System)
**Feature Overview:** Leave duration requests now automatically regulate user inputs to prevent logging errors, adjusting total days automatically based on selected leave spans.

### Workflow:
1. Navigate to **Leave Approvals** (Create Leave Request).
2. Select an employee and navigate to the **Leave Duration** dropdown.
3. Select **"Full Day"**: Total Days calculates to exactly `1`. The Calendar Date selection becomes a single disabled date field based on user request date.
4. Select **"Half Day"**: Total Days calculates to exactly `0.5`. Time selection limits appear (First Half / Second Half).
5. Select **"Multiple Days"**: Functions as normal (Admin can pick From/To Dates, system tracks the exact range calculation).

### Testing Steps:
- [ ] Create a New Leave. Choose **"Full Day"**. Verify the `Total Days` box calculates stringently to 1 day and disables manual overriding.
- [ ] Switch to **"Half Day"**. Verify `Total Days` box becomes 0.5. Verify that Shift Timings input prompts appear and are selectable.
- [ ] Submit the respective entries and verify the math corresponds flawlessly on the Leave Approvals dashboard tables.

---

## 5. Department-Wise Modules (Role Settings / Task Mandatory Fixes)
**Feature Overview:** Task selections have been strictly scoped and corrected to save correctly towards their assigned roles, solving the task and mandatory task issues in the Role Settings module.

### Workflow:
1. Navigate to **HR Settings** -> **Department Wise Modules** (or Role Settings config page).
2. Select a targeted **Department** and subsequently, the specific **Level** / **Position**.
3. Under the tasks checklist, select tasks that should be tracked for this structural level.
4. Designate particular tasks as **Mandatory Tasks**.
5. Save the configuration. 

### Testing Steps:
- [ ] Configure a new Department scope and select specific tasks.
- [ ] Save the configuration to the backend.
- [ ] Refresh the page/edit the module, and **Verify** that the exact tasks selected (along with their Mandatory status tags) are fetched completely, confirming the "task dropping" issue has been resolved.

---
**End of Workflow & Testing Document**
