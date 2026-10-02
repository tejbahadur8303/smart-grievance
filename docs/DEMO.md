# Hackathon Live Demo Walkthrough

Follow these steps for a complete, end-to-end demonstration of the platform:

## Phase 1: Voice-First Citizen Grievance Lodging
1. **Open Citizen Flutter App** (or run login on port 3000/mobile).
2. Login with Citizen demo credentials:
   - **Phone**: `9876543203` | **Password**: `Village@123`
3. Notice the prominent **"बोलकर शिकायत करें (Speak a Complaint)"** hero banner.
4. Tap the microphone button.
5. The audio is captured, converted into text transcript:
   *"Hamare gaon me main sadak par bijli ka taar toota hua pada hai aur current ka khatra hai. Kripya turant theek karwayein."*
6. Notice the **AI classification box**:
   - **Category**: `Streetlights & Electrical`
   - **Department**: `Rural Electricity Board`
   - **Priority**: `CRITICAL` (Detected live wire electrocution hazard)
   - **SLA**: 12 hours
7. Add landmark: *"Near Shiv Mandir Pole #14"* and tap **"शिकायत भेजें (Submit Complaint)"**.
8. Notice the instant code generation: `GRV-2026-0007`.

---

## Phase 2: Panchayat Officer Verification & Work Dispatch
1. Open the **Panchayat Officer Web Portal** at `http://localhost:3001`.
2. Login as Panchayat Sachiv:
   - **Phone**: `9876543201` | **Password**: `Village@123`
3. The new complaint `GRV-2026-0007` appears in the incoming unverified queue.
4. Click to open the action drawer:
   - Review AI confidence score and reasoning.
   - Check duplicate detection radar.
5. Tap **"Verify Grievance"**.
6. Select field technician: *"Manoj Kumar (Field Technician)"*, set deadline, and click **"Dispatch Work Order"**.
7. The complaint transitions to `ASSIGNED` and a `WorkerTask` (`TSK-2026-0003`) is created.

---

## Phase 3: Field Worker Proof-of-Work Execution
1. Open the **Field Worker App** on mobile or emulator.
2. Login as Worker:
   - **Phone**: `9876543202` | **Password**: `Village@123`
3. Tap the newly received work order `TSK-2026-0003`.
4. Click **"Accept Task"** &rarr; status updates to `ACCEPTED`.
5. Click **"Capture Before Photo & Start"** &rarr; status updates to `IN_PROGRESS` (Citizen sees active progress).
6. Enter completion note: *"Disconnected damaged wire, secured pole insulator, restored supply."*
7. Click **"Upload After Photo & Resolve Task"** with GPS stamp.
8. Grievance transitions to `RESOLVED` / `CITIZEN_VERIFICATION_PENDING`.

---

## Phase 4: Mandatory Citizen Verification (Satisfaction / Reopen)
1. Switch back to the **Citizen App**.
2. Notice the prominent gold verification alert:
   **"क्या आपकी समस्या का समाधान हो गया है? (Has your issue been resolved?)"**
3. **Scenario A (Satisfaction)**:
   - Citizen clicks **"हाँ, समस्या हल हो गई (Yes, Resolved)"**.
   - Awards 5-star rating with note: *"बहुत जल्दी और अच्छा काम हुआ!"*.
   - Grievance officially transitions to `CLOSED`.
4. **Scenario B (Persisting Problem)**:
   - Citizen clicks **"नहीं, समस्या अभी भी है (No, Still Exists)"**.
   - Enters reason: *"बल्ब अभी भी नहीं जल रहा है"*.
   - Grievance status changes to `REOPENED` and Panchayat Sachiv receives an urgent alert!

---

## Phase 5: SLA Escalation & Admin Intelligence
1. Open the **District Admin Command Center** at `http://localhost:3000`.
2. Login as District Admin:
   - **Phone**: `9876543200` | **Password**: `Village@123`
3. Open **"SLA Escalations"**:
   - Tap **"Run SLA Scan Now"**.
   - Observe overdue cases automatically categorized into **Level 1**, **Level 2 (BDO)**, or **Level 3 (District Magistrate)**.
4. Open **"Ration Transparency"**:
   - Inspect Fair Price Shop quotas (Wheat, Rice, Sugar).
   - Review citizen flagged discrepancy complaints for short quantity or overcharging.
5. Open **"Welfare Schemes"**:
   - Review applications for PM Awas Gramin and Kisan Samman Nidhi.
