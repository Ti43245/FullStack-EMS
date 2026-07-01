import { Inngest } from "inngest";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import sendEmail from "../config/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "fullstack-ems" });

// Auto Check-out for employees
const autoCheckout = inngest.createFunction(
  { id: "auto-check-out", triggers: [{event: "employee/check-out"}]},
  
  async ({ event, step }) => {
    const {employeeId, attendanceId} = event.data;

    // wait for 9 hours
    await step.sleepUntil("wait-for-the-9-hours", new Date(new Date().getTime() + 9 * 60 * 60 * 1000))
    
    // get Attendance data
    let attendance = await Attendance.findById(attendanceId)

    if (!attendance?.checkOut){
        // get Employee data
        const employee = await Employee.findById(employeeId)

        // Send reminder email
        await sendEmail({
            to: employee.email,
            subject: "Attendance Check-out Reminder",
            body: `<div style="max-width: 600px;">
            <h2> Hi ${employee.firstName}, 👋 </h2>
            <p style="font-size: 16px;">You have a check-in in ${employee.department} today:</p>
            <p style="font-size: 18px; font-weight: bold; color:
            #007bff; margin: 8px 0;">${attendance?.checkIn?.
                toLocaleTimeString()} </p>
                <p style="font-size: 16px;">Please make sure to check-out in one hour.</p>
                <p style="font-size: 16px;">If you have any questions,
                please contact your admin.</p>
                <br />
                <p style="font-size: 16px;">Best Regards,</p>
                <p style="font-size: 16px;">EMS</p>
            
            </div>`
        })

        // After 10 hours, mark attendance as checked out with status "LATE"
        await step.sleepUntil("wait-for-the-1-hour", new Date(new Date().getTime() + 1 *60 * 60 * 1000))

        attendance = await Attendance.findById(attendanceId)
        if(!attendance?.checkOut){
            attendance.checkOut = new Date(attendance.checkIn).
            getTime() + 4 * 60 * 60 * 1000;
            attendance.workingHours = 4;
            attendance.dayType = "Half Day";
            attendance.status = "LATE";
            await attendance.save();
        }
    }
  },
);


// Send Email to admin, If admin doesn't take action on leave application within 24 hours
const leaveApplicationReminder = inngest.createFunction(
  { id: "leave-application-reminder", triggers: [{event: "leave/pending"}]},
 
  async ({ event, step }) => {
    const { leaveApplicationId } = event.data;

    // wait for 24 hours
    await step.sleepUntil("wait-for-the-24-hours", new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
  
    const leaveApplication = await LeaveApplication.findById(leaveApplicationId)

    if(leaveApplication?.status === "PENDING"){
        const employee = await Employee.findById(leaveApplication.employeeId)

        // Send reminder email to admin to take action on leave application
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `Leave Application Reminder`,
            body:`<div style="max-width: 600px;">
            <h2>Hi Admin, 👋</h2>
            <p style="font-size: 16px;">You have a leave application in 
            ${employee.department} today:</p>
            <p style="font-size: 18px; font-weight: bold; color:
            #007bff; margin: 8px 0;">${leaveApplication?.startDate?.
                toLocaleDateString()}</p>
                <p style="font-size: 16px;">Please make sure to take action on this leave application.</p>
                <br />
                <p style="font-size: 16px;">Best Regards,</p>
                <p style="font-size: 16px;">EMS</p>
            
            </div>`
        });
    }
  }
);

// Cron: 9:00 AM + 11:30 AM Yangon time
const attendanceReminderCron = inngest.createFunction(
  {
    id: "attendance-reminder-cron",
    triggers: [
      { cron: "TZ=Asia/Yangon 0 9 * * *" },   // 9:00 AM
      { cron: "TZ=Asia/Yangon 30 11 * * *" }  // 11:30 AM
    ],
  },

  async ({ step }) => {

    // =========================
    // Step 1: Get Yangon day range
    // =========================
    const today = await step.run("get-today-date", () => {
      const now = new Date();

      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Yangon",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const ygnDate = formatter.format(now); // YYYY-MM-DD

      const start = new Date(`${ygnDate}T00:00:00+06:30`);
      const end = new Date(`${ygnDate}T23:59:59+06:30`);

      return {
        startUTC: start.toISOString(),
        endUTC: end.toISOString(),
      };
    });

    // =========================
    // Step 2: Active employees
    // =========================
    const activeEmployees = await step.run("get-active-employees", async () => {
      const employees = await Employee.find({
        isDeleted: false,
        employmentStatus: "ACTIVE",
      }).lean();

      return employees.map((e) => ({
        _id: e._id.toString(),
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        department: e.department,
      }));
    });

    // =========================
    // Step 3: Employees on leave
    // =========================
    const onLeaveIds = await step.run("get-on-leave-ids", async () => {
      const leaves = await LeaveApplication.find({
        status: "APPROVED",
        startDate: { $lte: new Date(today.endUTC) },
        endDate: { $gte: new Date(today.startUTC) },
      }).lean();

      return leaves.map((l) => l.employeeId.toString());
    });

    // =========================
    // Step 4: Already checked-in
    // =========================
    const checkedInIds = await step.run("get-checked-in-ids", async () => {
      const attendances = await Attendance.find({
        date: {
          $gte: new Date(today.startUTC),
          $lt: new Date(today.endUTC),
        },
      }).lean();

      return attendances.map((a) => a.employeeId.toString());
    });

    // =========================
    // Step 5: Filter absent
    // =========================
    const absentEmployees = activeEmployees.filter(
      (emp) =>
        !onLeaveIds.includes(emp._id) &&
        !checkedInIds.includes(emp._id)
    );

    // =========================
    // Step 6: Send emails safely
    // =========================
    if (absentEmployees.length > 0) {
      await step.run("send-reminder-emails", async () => {
        const emailPromises = absentEmployees.map((emp) =>
          sendEmail({
            to: emp.email,
            subject: "Attendance Reminder - Please Mark Your Attendance",
            body: `
              <div style="max-width: 600px; font-family: Arial, sans-serif;">
                <h2>Hi ${emp.firstName}, 👋</h2>

                <p style="font-size: 16px;">
                  We noticed you haven't marked your attendance yet today.
                </p>

                <p style="font-size: 16px;">
                  Please check in as soon as possible or contact your admin if you're facing any issues.
                </p>

                <br />

                <p style="font-size: 14px; color: #666;">
                  Department: ${emp.department}
                </p>

                <br />

                <p style="font-size: 16px;">Best Regards,</p>
                <p style="font-size: 16px;"><strong>QuickEMS</strong></p>
              </div>
            `,
          })
        );

        await Promise.all(emailPromises);

        return { emailsSent: absentEmployees.length };
      });
    }

    // =========================
    // Final return
    // =========================
    return {
      totalActive: activeEmployees.length,
      onLeave: onLeaveIds.length,
      checkedIn: checkedInIds.length,
      absent: absentEmployees.length,
      runAt: "Asia/Yangon",
    };
  }
);

export default attendanceReminderCron;

// Create an empty array where we'll export future Inngest functions
export const functions = [
    autoCheckout,
    leaveApplicationReminder,
    attendanceReminderCron
];
