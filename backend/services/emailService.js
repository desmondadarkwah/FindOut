const nodemailer = require('nodemailer');

// ✅ Reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ✅ Base email template
const baseTemplate = (content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #f1f5f9; padding: 32px; border-radius: 16px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="background: linear-gradient(135deg, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0;">
        FindOut
      </h1>
      <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 4px 0 0;">Peer Learning Platform</p>
    </div>
    ${content}
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
      <p style="color: rgba(255,255,255,0.25); font-size: 12px; margin: 0;">
        © 2026 FindOut. You're receiving this because you have an account on FindOut.
      </p>
    </div>
  </div>
`;

// ✅ Send join request approved email
const sendJoinRequestApprovedEmail = async ({ recipientEmail, recipientName, groupName }) => {
  try {
    const transporter = createTransporter();

    const content = `
      <div style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
        <h2 style="color: #4ade80; margin: 0 0 8px;">Join Request Approved!</h2>
        <p style="color: rgba(255,255,255,0.6); margin: 0;">You've been accepted into a study group</p>
      </div>
      <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">
        Hi <strong style="color: #f1f5f9;">${recipientName}</strong>,
      </p>
      <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">
        Great news! Your request to join <strong style="color: #a5b4fc;">${groupName}</strong> has been approved. 
        You can now access the group and start collaborating with your peers.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.FRONTEND_URL}/inbox" 
           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">
          Open FindOut →
        </a>
      </div>
    `;

    await transporter.sendMail({
      from: `"FindOut" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `✅ You've been approved to join ${groupName}`,
      html: baseTemplate(content),
    });

    console.log(`✅ Approval email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('❌ Error sending approval email:', error.message);
  }
};

// ✅ Send added to group email
const sendAddedToGroupEmail = async ({ recipientEmail, recipientName, groupName, addedByName }) => {
  try {
    const transporter = createTransporter();

    const content = `
      <div style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">👥</div>
        <h2 style="color: #a5b4fc; margin: 0 0 8px;">You've Been Added to a Group!</h2>
        <p style="color: rgba(255,255,255,0.6); margin: 0;">A new study group awaits you</p>
      </div>
      <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">
        Hi <strong style="color: #f1f5f9;">${recipientName}</strong>,
      </p>
      <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">
        <strong style="color: #a5b4fc;">${addedByName}</strong> has added you to the study group 
        <strong style="color: #a5b4fc;">${groupName}</strong> on FindOut. 
        Join your new group and start learning together!
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.FRONTEND_URL}/inbox" 
           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">
          Open Group →
        </a>
      </div>
    `;

    await transporter.sendMail({
      from: `"FindOut" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `👥 You've been added to ${groupName} on FindOut`,
      html: baseTemplate(content),
    });

    console.log(`✅ Added-to-group email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('❌ Error sending added-to-group email:', error.message);
  }
};

// ✅ Send quiz verified email
const sendQuizVerifiedEmail = async ({ recipientEmail, recipientName, subject }) => {
  try {
    const transporter = createTransporter();

    const content = `
      <div style="background: rgba(234,179,8,0.08); border: 1px solid rgba(234,179,8,0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
        <h2 style="color: #fbbf24; margin: 0 0 8px;">You're Now a Verified Teacher!</h2>
        <p style="color: rgba(255,255,255,0.6); margin: 0;">Congratulations on your achievement</p>
      </div>
      <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">
        Hi <strong style="color: #f1f5f9;">${recipientName}</strong>,
      </p>
      <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">
        Congratulations! You've passed the <strong style="color: #fbbf24;">${subject}</strong> verification quiz 
        and earned your <strong style="color: #fbbf24;">Verified Teacher</strong> badge on FindOut. 
        Your expertise is now recognized by the community!
      </p>
      <div style="background: rgba(234,179,8,0.06); border: 1px solid rgba(234,179,8,0.15); border-radius: 10px; padding: 16px; margin: 20px 0; text-align: center;">
        <p style="color: #fbbf24; font-weight: bold; margin: 0; font-size: 15px;">
          ✅ Verified in: ${subject}
        </p>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.FRONTEND_URL}/verification" 
           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">
          View Your Badge →
        </a>
      </div>
    `;

    await transporter.sendMail({
      from: `"FindOut" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🎉 You're now a Verified Teacher in ${subject} on FindOut!`,
      html: baseTemplate(content),
    });

    console.log(`✅ Verification email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
  }
};

module.exports = {
  sendJoinRequestApprovedEmail,
  sendAddedToGroupEmail,
  sendQuizVerifiedEmail,
};