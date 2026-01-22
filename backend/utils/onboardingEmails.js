const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Helper function to get document path (works with Azure and local)
const getDocumentPath = (filename) => {
  // Check for Azure-specific environment variable first
  if (process.env.DOCUMENTS_DIR) {
    return path.join(process.env.DOCUMENTS_DIR, filename);
  }
  
  // For Azure App Services
  if (process.env.WEBSITE_INSTANCE_ID) {
    return path.join('/home/site/wwwroot', 'documents', filename);
  }
  
  // For local development
  return path.join(__dirname, '../documents', filename);
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const winwireLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // Placeholder

// Email 1: Welcome & Support Contacts
const sendWelcomeSupportEmail = async (employeeEmail, employeeName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: employeeEmail,
    subject: 'Welcome to WinWire - Important Support Contacts',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
          </div>
        </div>
        <div style="padding: 30px;">
          <p style="color: #000000; font-size: 14px;">Hi,</p>
          <p style="color: #000000; font-size: 14px; line-height: 1.6;">Welcome to WinWire! As you embark on this exciting journey with us, we want to ensure that you have all the resources you need to succeed. Below, you will find a list of important email addresses for our support teams. If you have any questions or need clarification, please do not hesitate to reach out to the respective teams. A member of our team will promptly respond to assist you.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 13px;">
            <thead>
              <tr style="background: #0066CC; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #DDDDDD;">Function</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #DDDDDD;">Email Id</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #DDDDDD;">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #DDDDDD;"><strong>HR</strong></td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">HR@WinWire.com</td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">For any queries, clarifications, grievances</td>
              </tr>
              <tr style="background: #F5F5F5;">
                <td style="padding: 10px; border: 1px solid #DDDDDD;"><strong>L&D</strong></td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">winwirelearning@WinWire.com</td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">For information on upskilling, certifications</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #DDDDDD;"><strong>IT</strong></td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">ITSupport@WinWire.com</td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">For any support related to IT assets, IT security</td>
              </tr>
              <tr style="background: #F5F5F5;">
                <td style="padding: 10px; border: 1px solid #DDDDDD;"><strong>Finance</strong></td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">Financeteam@WinWire.com</td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">For salary, tax, payment related queries</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #DDDDDD;"><strong>Admin</strong></td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">adminteam@winwire.com</td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">For facilities and logistic support</td>
              </tr>
            </tbody>
          </table>

          <p style="color: #000000; font-size: 14px; line-height: 1.6;">We look forward to supporting you in every step of your journey with us.</p>
          
          <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
          <p style="color: #666666; font-size: 13px; margin: 0;">
            Thanks and Regards,<br>
            <strong style="color: #000000;">WinWire</strong><br>
            HR Team<br>
            +91.8688500057
          </p>
        </div>
      </div>
    `,
    attachments: []
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email 1/5 (Welcome Support) sent successfully to ${employeeEmail}`);
  } catch (error) {
    console.error(`❌ Error sending Email 1/5 to ${employeeEmail}:`, error.message);
    throw error;
  }
};

// Email 2: WinPay Time Tracking System
const sendWinPayInstructionsEmail = async (employeeEmail, employeeName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: employeeEmail,
    subject: 'WinPay Time Tracking System - Important Guidelines | WinWire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
          </div>
        </div>
        <div style="padding: 30px;">
          <p style="color: #000000; font-size: 14px;">Dear WinWirean,</p>
          
          <h3 style="color: #0066CC; font-size: 16px; margin-top: 20px;">WinPay Time Tracking System</h3>
          
          <p style="color: #000000; font-size: 14px; line-height: 1.6;">Please be informed that all employees are required to log their effort on a weekly basis on our WinPay portal. Here are the important guidelines/instructions:</p>

          <h4 style="color: #000000; font-size: 15px; margin-top: 25px;">Important Points for Users:</h4>
          <ul style="color: #000000; font-size: 13px; line-height: 1.8; padding-left: 20px;">
            <li>Click on this link - <a href="http://winpay.azurewebsites.net/WinTime/GetEmployeeTimeSheets" style="color: #0066CC;">WinPay Portal</a> (best browser: Chrome)</li>
            <li>Click on 'Add TimeSheet' to enter hours for the current week</li>
            <li>Click anywhere in the Week Range box to select earlier week/s and enter hours for past week/s</li>
            <li>Current week time sheet cannot be SUBMITTED until Friday, however, you can save time sheet at any point in time</li>
            <li><strong>Minimum of 8 hours a day and 40 hours a week are mandatory</strong>. In case of leave for full day, 8 hours to be entered and 4 hours in case of half day leave</li>
            <li>There are no validations for weekend (Saturday and Sunday), employees can log to the extent they work</li>
            <li>For non-delivery employees, their Department name will be auto-selected in the project/Activity field</li>
            <li>Delivery employees have to select project in the project/activity drop down and enter hours and description of work</li>
            <li>You can edit time sheet any time, till the same is approved</li>
            <li><strong>Remember to send time sheets every week on Friday without fail</strong></li>
          </ul>

          <h4 style="color: #000000; font-size: 15px; margin-top: 25px;">Important Points for Approvers:</h4>
          <ul style="color: #000000; font-size: 13px; line-height: 1.8; padding-left: 20px;">
            <li>Click on <a href="http://winpay.azurewebsites.net/WinTime/GetApproveTimeSheets" style="color: #0066CC;">Approval Portal</a></li>
            <li>There are two sub-menus: Submitted and Approved</li>
            <li>Time sheets submitted for approval are parked under Submitted menu</li>
            <li>Approvers are requested to wait till Monday before approving, as employees might work over the weekend and log their hours</li>
            <li>This application is responsive and can be browsed on mobile also</li>
          </ul>

          <div style="background: #FFF3CD; border-left: 4px solid #FF6600; padding: 15px; margin: 25px 0;">
            <p style="color: #856404; margin: 0; font-size: 13px;"><strong>Note:</strong> Please go through the User Guide and FAQ on the WinPay site under About menu for further details.</p>
          </div>

          <p style="color: #000000; font-size: 14px; line-height: 1.6;">In case of technical issues, please send an email to WinTime Dev Team.</p>

          <p style="color: #000000; font-size: 14px; line-height: 1.6;">Looking forward to your cooperation,</p>

          <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
          <p style="color: #666666; font-size: 13px; margin: 0;">
            <strong style="color: #000000;">WinWire</strong><br>
            HR Team - +91.8688500057
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email 2/5 (WinPay Instructions) sent successfully to ${employeeEmail}`);
  } catch (error) {
    console.error(`❌ Error sending Email 2/5 to ${employeeEmail}:`, error.message);
    throw error;
  }
};

// Email 3: Group Mediclaim Insurance
const sendMediclaimInsuranceEmail = async (employeeEmail, employeeName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: employeeEmail,
    subject: 'Group Mediclaim Insurance Policy - Action Required | WinWire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
          </div>
        </div>
        <div style="padding: 30px;">
          <p style="color: #000000; font-size: 14px;">Hi,</p>
          
          <p style="color: #000000; font-size: 14px; line-height: 1.6;">This is with regards to the group Mediclaim insurance policy we have taken for our employees. You are requested to submit your options before EOD today to include in the policy.</p>

          <h4 style="color: #0066CC; font-size: 15px; margin-top: 25px;">Steps to Follow:</h4>
          <ol style="color: #000000; font-size: 13px; line-height: 1.8; padding-left: 20px;">
            <li>Check premium for different options in the excel attached. Excel is self-explanatory and for your reference only</li>
            <li>Click here <a href="https://winemployee.winwire.com/Insurance" style="color: #0066CC;">https://winemployee.winwire.com/Insurance</a> to exercise your options</li>
            <li>You will see premium amount for the options chosen in the application</li>
            <li>Check box for all the members you wish to get insurance coverage</li>
            <li>If family member details are missing, send email to HR@winwire.com</li>
          </ol>

          <h4 style="color: #000000; font-size: 15px; margin-top: 25px;">Important Points:</h4>
          <ul style="color: #000000; font-size: 13px; line-height: 1.8; padding-left: 20px;">
            <li><strong>Once options are exercised and submitted, there is no option for making changes</strong></li>
            <li>Employee cannot opt out of insurance coverage. Coverage for dependents is optional</li>
            <li>Mid-term inclusion of family members or change of sum assured is not allowed as per regulatory guidelines</li>
            <li>Siblings & In-laws are not allowed to be included in the policy</li>
            <li>Premium in excess of eligibility amount will be recovered from salary as one-time deduction</li>
            <li>Maximum eligibility per day for Room Rent is 1.5% and ICU is 3% of Sum assured</li>
            <li>Maternity: Maximum INR 50,000/- for Normal delivery and INR 70,000/- for C-Section</li>
            <li>Cataract Surgery: Limit increased to INR 30,000/- per eye</li>
          </ul>

          <div style="background: #FFF3CD; border-left: 4px solid #FF6600; padding: 15px; margin: 25px 0;">
            <p style="color: #856404; margin: 0; font-size: 13px;"><strong>Important:</strong> Be prudent in your decision on sum assured. We will not be able to make changes once the policy starts on 01-Aug-2025.</p>
          </div>

          <p style="color: #000000; font-size: 14px; line-height: 1.6;">Please reach out to HR team in case you need any clarifications.</p>

          <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
          <p style="color: #666666; font-size: 13px; margin: 0;">
            Thanks and Regards,<br>
            <strong style="color: #000000;">WinWire</strong><br>
            HR Team<br>
            +91.8688500057
          </p>
        </div>
      </div>
    `,
    attachments: []
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email 3/5 (Mediclaim Insurance) sent successfully to ${employeeEmail}`);
  } catch (error) {
    console.error(`❌ Error sending Email 3/5 to ${employeeEmail}:`, error.message);
    throw error;
  }
};

// Email 4: Facebook Group
const sendFacebookGroupEmail = async (employeeEmail, employeeName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: employeeEmail,
    subject: 'Join WinWire Facebook Group | WinWire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
          </div>
        </div>
        <div style="padding: 30px;">
          <p style="color: #000000; font-size: 14px;">Hi,</p>
          
          <p style="color: #000000; font-size: 14px; line-height: 1.6;">We would like to inform you that WinWire has its internal Facebook group where we publish all our updates like birthday wishes, work anniversaries, celebrations, Customer meets, new project wins and many other updates.</p>

          <p style="color: #000000; font-size: 14px; line-height: 1.6;">Please send us a friend request from your Facebook ID to the below HR ID and we will then add you to the WinWire Facebook Group.</p>

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://www.facebook.com/profile.php?id=100015585903861" style="display: inline-block; padding: 12px 30px; background: #0066CC; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">Send Friend Request</a>
          </div>

          <p style="color: #000000; font-size: 14px; line-height: 1.6; text-align: center;"><a href="https://www.facebook.com/profile.php?id=100015585903861" style="color: #0066CC;">https://www.facebook.com/profile.php?id=100015585903861</a></p>

          <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
          <p style="color: #666666; font-size: 13px; margin: 0;">
            Thanks and Regards,<br>
            <strong style="color: #000000;">WinWire</strong><br>
            HR Team<br>
            +91.8688500057
          </p>
        </div>
      </div>
    `,
    attachments: []
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email 4/5 (Facebook Group) sent successfully to ${employeeEmail}`);
  } catch (error) {
    console.error(`❌ Error sending Email 4/5 to ${employeeEmail}:`, error.message);
    throw error;
  }
};

// Email 5: Employee ID, Manager, Handbook & Holidays
const sendEmployeeDetailsEmail = async (employee, reportingManager) => {
  let joiningDate = '';
  try {
    if (employee.joiningDate) {
      joiningDate = new Date(employee.joiningDate).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  } catch (error) {
    console.warn('⚠️ Could not format joining date:', error.message);
    joiningDate = 'TBA';
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: employee.email,
    subject: 'Your Employee ID and Important Resources | WinWire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
          </div>
        </div>
        <div style="padding: 30px;">
          <p style="color: #000000; font-size: 14px;">Dear WinWireans,</p>
          
          <p style="color: #000000; font-size: 14px; line-height: 1.6;">It gives me great pleasure to welcome you all to WinWire.</p>
          
          <h3 style="color: #0066CC; font-size: 16px; margin-top: 20px;">Your Employee IDs</h3>
          <p style="color: #000000; font-size: 14px; line-height: 1.6;">Please use the Employee ID <strong>${employee.employeeId}</strong> as a reference code for all official transactions and mention it correctly wherever you are asked to.</p>

          <p style="color: #000000; font-size: 14px; line-height: 1.6;">Please find the WinWire Values document and Holiday lists in the link below. This document would provide guidance and information related to our company's values, policies, procedures and benefits. Please go through all the documents in detail.</p>

          <h4 style="color: #0066CC; font-size: 15px; margin-top: 25px;">📁 Important Documents</h4>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://drive.google.com/drive/folders/1vDPvNgchufuegt0-pqU8azw_aM_IL4mz" style="display: inline-block; padding: 12px 30px; background: #0066CC; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">Access Documents on Google Drive</a>
          </div>
          <p style="color: #666666; font-size: 12px; text-align: center;">
            <a href="https://drive.google.com/drive/folders/1vDPvNgchufuegt0-pqU8azw_aM_IL4mz" style="color: #0066CC;">https://drive.google.com/drive/folders/1vDPvNgchufuegt0-pqU8azw_aM_IL4mz</a>
          </p>

          
        

          <p style="color: #000000; font-size: 14px; line-height: 1.6;">If you have any questions, please feel free to reach out to the below mentioned HR team member.</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <thead>
              <tr style="background: #0066CC; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #DDDDDD;">Name</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #DDDDDD;">Designation</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #DDDDDD;">Contact Number</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #DDDDDD;">Email ID</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">Hr Team</td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">Senior Manager-HR</td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;">8688500057</td>
                <td style="padding: 10px; border: 1px solid #DDDDDD;"><a href="mailto:hr@WinWire.com" style="color: #0066CC;">Srikanth.Patnaik@WinWire.com</a></td>
              </tr>
            </tbody>
          </table>

          <p style="color: #000000; font-size: 14px; line-height: 1.6; margin-top: 25px;">We wish you all the very best for your career at WinWire!</p>

          <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
          <p style="color: #666666; font-size: 13px; margin: 0;">
            Thanks and Regards,<br>
            <strong style="color: #000000;">WinWire</strong><br>
            HR Team<br>
            +91.8688500057
          </p>
        </div>
      </div>
    `,
    attachments: []
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email 5/5 (Employee Details) sent successfully to ${employee.email}`);
  } catch (error) {
    console.error(`❌ Error sending Email 5/5 to ${employee.email}:`, error.message);
    throw error;
  }
};

// Send all 5 onboarding emails sequentially
const sendAllOnboardingEmails = async (employee, reportingManager = 'Will be assigned shortly') => {
  try {
    // Validate employee object
    if (!employee || !employee.email || !employee.fullName) {
      throw new Error(`Invalid employee object: email=${employee?.email}, fullName=${employee?.fullName}`);
    }
    
    // Check email configuration
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ WARNING: Email configuration incomplete!');
      console.warn('   EMAIL_HOST:', process.env.EMAIL_HOST ? '✓ Set' : '✗ Not Set');
      console.warn('   EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Not Set');
      console.warn('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not Set');
      console.warn('   EMAIL_FROM:', process.env.EMAIL_FROM ? '✓ Set' : '✗ Not Set');
      console.warn('   FRONTEND_URL:', process.env.FRONTEND_URL ? '✓ Set' : '✗ Not Set');
    }
    
    console.log(`📧 Sending onboarding emails to ${employee.email} (${employee.fullName})...`);
    console.log(`📧 Environment: NODE_ENV=${process.env.NODE_ENV}`);
    
    
    // Send emails one by one with delay - continue even if one fails
    try {
      console.log('  📤 Sending Email 1/5: Welcome & Support Contacts...');
      await sendWelcomeSupportEmail(employee.email, employee.fullName);
      console.log('  ✅ Email 1/5: Welcome & Support Contacts sent');
    } catch (error) {
      console.error('  ❌ Error sending Email 1/5:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      console.log('  📤 Sending Email 2/5: WinPay Instructions...');
      await sendWinPayInstructionsEmail(employee.email, employee.fullName);
      console.log('  ✅ Email 2/5: WinPay Instructions sent');
    } catch (error) {
      console.error('  ❌ Error sending Email 2/5:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      console.log('  📤 Sending Email 3/5: Mediclaim Insurance...');
      await sendMediclaimInsuranceEmail(employee.email, employee.fullName);
      console.log('  ✅ Email 3/5: Mediclaim Insurance sent');
    } catch (error) {
      console.error('  ❌ Error sending Email 3/5:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      console.log('  📤 Sending Email 4/5: Facebook Group Invitation...');
      await sendFacebookGroupEmail(employee.email, employee.fullName);
      console.log('  ✅ Email 4/5: Facebook Group Invitation sent');
    } catch (error) {
      console.error('  ❌ Error sending Email 4/5:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      console.log('  📤 Sending Email 5/5: Employee Details & Resources...');
      await sendEmployeeDetailsEmail(employee, reportingManager);
      console.log('  ✅ Email 5/5: Employee Details & Resources sent');
    } catch (error) {
      console.error('  ❌ Error sending Email 5/5:', error.message);
      // Continue with next email instead of stopping
    }
    
    console.log(`✅ Onboarding email sequence completed for ${employee.email}`);
    return true;
  } catch (error) {
    console.error('❌ Critical error in onboarding email sequence:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeSupportEmail,
  sendEmployeeDetailsEmail,
  sendWinPayInstructionsEmail,
  sendMediclaimInsuranceEmail,
  sendFacebookGroupEmail,
  sendAllOnboardingEmails
};
