const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test email connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service ready. Connected to:', process.env.EMAIL_HOST);
  }
});

// Validate FRONTEND_URL configuration
const getFrontendUrl = () => {
  if (!process.env.FRONTEND_URL) {
    console.error('❌ CRITICAL: FRONTEND_URL environment variable is not set!');
    console.error('   This will cause email links to show as "undefined"');
    console.error('   Please add FRONTEND_URL to your .env file');
    console.error('   Example: FRONTEND_URL=https://your-domain.com');
    // Provide a helpful fallback for development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('   Using localhost fallback for development');
      return 'http://localhost:3000';
    }
    throw new Error('FRONTEND_URL is not configured. Email links cannot be generated.');
  }
  return process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash if present
};

const sendOfferEmail = async (candidate, acceptToken) => {
  const frontendUrl = getFrontendUrl();
  const acceptLink = `${frontendUrl}/accept-offer/${acceptToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: candidate.email,
    subject: 'Job Offer - ' + candidate.position + ' | Winwire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
          </div>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #000000; margin-bottom: 20px; font-size: 22px;">Offer Letter</h2>
          <p style="color: #000000;">Dear <strong>${candidate.fullName}</strong>,</p>
          <p style="color: #000000; line-height: 1.6;">We are pleased to extend an offer for the position of <strong>${candidate.position}</strong> in the <strong>${candidate.department}</strong> practice at Winwire.</p>
          <p style="color: #000000; line-height: 1.6;">Please find your offer letter attached to this email. Kindly review the document and accept the offer using the button below.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptLink}" style="display: inline-block; padding: 12px 30px; background: #0066CC; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">Accept Offer</a>
          </div>
          <p style="color: #666666; font-size: 13px;"><strong>Note:</strong> This acceptance link will expire in 7 days.</p>
          <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
          <p style="color: #666666; font-size: 13px; margin: 0;">
            Thanks and Regards,<br>
            <strong style="color: #000000;">WinWire</strong><br>
            HR Team - +91.8688500057
          </p>
        </div>
      </div>
    `,
    attachments: [{
      filename: 'Offer_Letter.pdf',
      path: candidate.offerLetterPath
    }]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Offer email sent to ${candidate.email}`);
  } catch (error) {
    console.error('Error sending offer email:', error);
    throw error;
  }
};

const sendJoiningCredentials = async (candidate, tempPassword) => {
  const frontendUrl = getFrontendUrl();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: candidate.email,
    subject: 'Onboarding Portal Credentials | Winwire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
          </div>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #000000; margin-bottom: 20px; font-size: 22px;">Onboarding Portal Access</h2>
          <p style="color: #000000;">Dear <strong>${candidate.fullName}</strong>,</p>
          <p style="color: #000000; line-height: 1.6;">Your onboarding process has been initiated for the <strong>${candidate.department}</strong> practice. Please use the credentials below to access the onboarding portal and complete your joining formalities.</p>
          <div style="background: #F5F5F5; padding: 20px; border-left: 4px solid #0066CC; margin: 20px 0;">
            <p style="margin: 8px 0; color: #000000;"><strong>Login Email:</strong> ${candidate.email}</p>
            <p style="margin: 8px 0; color: #000000;"><strong>Temporary Password:</strong> <code style="background: #DDDDDD; padding: 4px 8px; border-radius: 3px; font-size: 14px; color: #000000;">${tempPassword}</code></p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/login" style="display: inline-block; padding: 12px 30px; background: #0066CC; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">Access Portal</a>
          </div>
          <div style="background: #FFF3CD; border-left: 4px solid #FF6600; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 13px;"><strong>Important:</strong> Please change your password immediately after your first login for security purposes.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
          <p style="color: #666666; font-size: 13px; margin: 0;">
            Best Regards,<br>
            <strong style="color: #000000;">Winwire HR Team</strong><br>
            <span style="color: #0066CC;">Practice: ${candidate.department}</span>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Joining credentials sent to ${candidate.email}`);
  } catch (error) {
    console.error('Error sending credentials:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (newEmployee, allEmployees) => {
  const emailPromises = allEmployees.map(async (emp) => {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emp.email,
      subject: 'New Team Member - ' + newEmployee.fullName + ' | ' + newEmployee.department,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
            </div>
          </div>
          <div style="padding: 30px; background: white; text-align: center;">
            <h2 style="color: #000000; margin-bottom: 20px; font-size: 22px;">Welcome Our New Team Member</h2>
            ${newEmployee.profilePhoto && newEmployee.profilePhoto.data ? `<img src="data:${newEmployee.profilePhoto.contentType};base64,${newEmployee.profilePhoto.data.toString('base64')}" alt="${newEmployee.fullName}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 20px 0; border: 3px solid #0066CC;">` : '<div style="width: 120px; height: 120px; border-radius: 50%; background: #E0E0E0; margin: 20px auto; border: 3px solid #0066CC; display: flex; align-items: center; justify-content: center; color: #999;">No Photo</div>'}
            <h3 style="color: #000000; margin: 15px 0; font-size: 20px;">${newEmployee.fullName}</h3>
            <p style="color: #666666; font-size: 15px; margin: 10px 0;"><strong>Practice:</strong> <span style="color: #0066CC;">${newEmployee.department}</span></p>
            <div style="background: #F5F5F5; padding: 20px; border-radius: 4px; margin: 25px 0; text-align: left;">
              <h4 style="color: #000000; margin-top: 0; font-size: 15px;">About:</h4>
              <p style="color: #333333; line-height: 1.6; font-size: 14px; margin: 0;">${newEmployee.aboutMe || 'Looking forward to contributing to the team!'}</p>
            </div>
            <p style="color: #000000; font-size: 14px; line-height: 1.6;">Please join us in welcoming ${newEmployee.fullName} to the Winwire team. We look forward to their contributions in the ${newEmployee.department} practice.</p>
            <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
            <p style="color: #666666; font-size: 13px; margin: 0; text-align: left;">
              Best Regards,<br>
              <strong style="color: #000000;">Winwire HR Team</strong>
            </p>
          </div>
        </div>
      `
    };

    return transporter.sendMail(mailOptions);
  });

  try {
    await Promise.all(emailPromises);
    console.log(`✅ Welcome emails sent to ${allEmployees.length} employees`);
  } catch (error) {
    console.error(' Error sending welcome emails:', error);
    // Don't throw - this is non-critical
  }
};

const sendOnboardingPassEmail = async (submission, passToken) => {
  const frontendUrl = getFrontendUrl();
  const acceptLink = `${frontendUrl}/accept-onboarding-pass/${passToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: submission.email,
    subject: 'Onboarding Pass - Complete Your Joining | Winwire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
          </div>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #000000; margin-bottom: 20px; font-size: 22px;">Onboarding Pass Approved</h2>
          <p style="color: #000000;">Dear <strong>${submission.firstName} ${submission.lastName}</strong>,</p>
          <p style="color: #000000; line-height: 1.6;">Congratulations! Your onboarding submission has been reviewed and approved by our HR team.</p>
          <p style="color: #000000; line-height: 1.6;">You are one step away from becoming an official Winwire team member. Please accept your Onboarding Pass to complete the process.</p>
          
          <div style="background: #F5F5F5; padding: 20px; border-left: 4px solid #0066CC; margin: 20px 0;">
            <p style="margin: 8px 0; color: #000000;"><strong>Department:</strong> ${submission.department}</p>
            <p style="margin: 8px 0; color: #000000;"><strong>Email:</strong> ${submission.email}</p>
            <p style="margin: 8px 0; color: #000000;"><strong>Phone:</strong> ${submission.phone}</p>
            ${submission.dateOfJoining ? `<p style="margin: 8px 0; color: #000000;"><strong>Date of Joining:</strong> ${new Date(submission.dateOfJoining).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
          </div>

          ${submission.dateOfJoining ? `<div style="background: #E8F4FD; border: 2px solid #0066CC; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
            <p style="color: #0066CC; font-size: 18px; font-weight: 600; margin: 0;">You will be joining us on ${new Date(submission.dateOfJoining).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="color: #000000; font-size: 16px; margin: 10px 0 0 0;">Welcome to Winwire!</p>
          </div>` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptLink}" style="display: inline-block; padding: 15px 40px; background: #0066CC; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">Accept Onboarding Pass</a>
          </div>

          <div style="background: #E8F4FD; border-left: 4px solid #0066CC; padding: 15px; margin: 20px 0;">
            <p style="color: #000000; margin: 0; font-size: 14px;"><strong>What happens next?</strong></p>
            <ul style="color: #333333; font-size: 13px; line-height: 1.8; margin: 10px 0;">
              <li>Click "Accept Onboarding Pass" above</li>
              <li>Your employee account will be created immediately</li>
              <li>You'll receive 5 onboarding emails with all joining details</li>
              <li>All team members will be notified of your joining</li>
            </ul>
          </div>

          <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
          <p style="color: #666666; font-size: 13px; margin: 0;">
            Best Regards,<br>
            <strong style="color: #000000;">Winwire HR Team</strong><br>
            <span style="color: #0066CC;">Practice: ${submission.department}</span>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Onboarding Pass email sent to ${submission.email}`);
  } catch (error) {
    console.error('❌ Error sending onboarding pass email:', error);
    throw error;
  }
};

const sendRevisionRequestEmail = async (email, firstName, remarks) => {
  const frontendUrl = getFrontendUrl();
  const displayName = firstName && firstName !== 'undefined' ? firstName : 'Team Member';
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Onboarding Form Updation Required | Winwire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF;">
        <div style="background: white; padding: 20px; text-align: center; border-bottom: 3px solid #0066CC;">
          <div style="display: inline-block; font-size: 32px; font-weight: 700; font-style: italic;">
            <span style="color: #0066CC;">Win</span><span style="color: #DC3545;">Wire</span>
          </div>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #DC3545; margin-bottom: 20px; font-size: 22px;">Updation Required</h2>
          <p style="color: #000000;">Dear <strong>${displayName}</strong>,</p>
          <p style="color: #000000; line-height: 1.6;">Your onboarding form submission requires some revisions. Please review the feedback below and resubmit the corrected information.</p>
          
          <div style="background: #FFF3CD; border-left: 4px solid #FF6600; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 8px 0; font-weight: 600;">HR Feedback:</p>
            <p style="color: #333333; margin: 8px 0; line-height: 1.6;">${remarks}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/login" style="display: inline-block; padding: 12px 30px; background: #0066CC; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">Update Submission</a>
          </div>

          <div style="background: #E8F4FD; border-left: 4px solid #0066CC; padding: 15px; margin: 20px 0;">
            <p style="color: #000000; margin: 0; font-size: 14px;"><strong>What to do:</strong></p>
            <ul style="color: #333333; font-size: 13px; line-height: 1.8; margin: 10px 0;">
              <li>Click "Update Submission" above</li>
              <li>Make the necessary corrections</li>
              <li>Resubmit the form with updated information</li>
              <li>HR will review the revised submission</li>
            </ul>
          </div>

          <hr style="border: none; border-top: 1px solid #DDDDDD; margin: 30px 0;">
          <p style="color: #666666; font-size: 13px; margin: 0;">
            Best Regards,<br>
            <strong style="color: #000000;">Winwire HR Team</strong>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Revision request email sent to ${email}`);
  } catch (error) {
    console.error('Error sending revision request email:', error);
    throw error;
  }
};

module.exports = {
  sendOfferEmail,
  sendJoiningCredentials,
  sendWelcomeEmail,
  sendOnboardingPassEmail,
  sendRevisionRequestEmail
};
