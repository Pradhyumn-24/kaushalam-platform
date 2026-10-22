import nodemailer from 'nodemailer';
import { getDb, persistDb } from './db.js';

interface EmailPayload {
  to: string;
  recipientName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  eventType: 'booking_requested' | 'booking_approved' | 'booking_rejected' | 'welcome';
}

function getMailTransporter() {
  const host = process.env.MAIL_SERVER;
  const port = parseInt(process.env.MAIL_PORT || '587', 10);
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  const useTls = process.env.MAIL_USE_TLS !== 'false';

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; outboxId: number; message: string }> {
  const db = await getDb();
  const now = new Date().toISOString();
  const sender = process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME || 'kaushalam-notifications@kiet.edu';

  // 1. Record in notification_outbox table first (guarantees record preservation)
  db.run(
    `INSERT INTO notification_outbox (recipient_email, recipient_name, subject, body_html, body_text, event_type, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'queued', ?)`,
    [payload.to, payload.recipientName, payload.subject, payload.bodyHtml, payload.bodyText, payload.eventType, now]
  );

  const outboxRes = db.exec(`SELECT last_insert_rowid() as id`);
  const outboxId = (outboxRes && outboxRes.length > 0 && outboxRes[0].values.length > 0)
    ? (outboxRes[0].values[0][0] as number)
    : 1;
  persistDb();

  const transporter = getMailTransporter();

  if (!transporter) {
    const diagnosticNote = `SMTP not fully configured (set MAIL_SERVER, MAIL_USERNAME, MAIL_PASSWORD in environment). Email logged in database outbox ID #${outboxId}.`;
    console.log(`[Kaushalam Email Outbox] Dispatch simulated to ${payload.to} for event: ${payload.eventType}. (SMTP credentials unconfigured)`);
    return {
      success: true,
      outboxId,
      message: diagnosticNote
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Kaushalam Peer Learning" <${sender}>`,
      to: payload.to,
      subject: payload.subject,
      text: payload.bodyText,
      html: payload.bodyHtml
    });

    db.run(
      `UPDATE notification_outbox SET status = 'sent', sent_at = ? WHERE id = ?`,
      [new Date().toISOString(), outboxId]
    );
    persistDb();

    console.log(`[Kaushalam Email] Successfully delivered message ${info.messageId} to ${payload.to}`);
    return {
      success: true,
      outboxId,
      message: `Email successfully delivered via SMTP to ${payload.to}.`
    };
  } catch (error: any) {
    const safeError = error?.message || 'Unknown SMTP transport failure';
    console.error(`[Kaushalam Email Error] Failed sending to ${payload.to}: ${safeError}`);

    db.run(
      `UPDATE notification_outbox SET status = 'failed', error_message = ? WHERE id = ?`,
      [safeError, outboxId]
    );
    persistDb();

    return {
      success: false,
      outboxId,
      message: `Failed sending to ${payload.to}: ${safeError}. Booking was preserved.`
    };
  }
}

// Concrete notification helpers
export async function sendSessionRequestedEmail(data: {
  teacherEmail: string;
  teacherName: string;
  learnerName: string;
  learnerEmail: string;
  course: string;
  skill: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  learningObjective: string;
  requestId: number;
}) {
  const subject = `[Kaushalam] New Peer Session Request: ${data.skill} from ${data.learnerName}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 20px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">Kaushalam — Campus Peer Learning</h1>
        <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 14px;">Incoming Student Session Request</p>
      </div>

      <p style="font-size: 16px; color: #1e293b;">Hello <strong>${data.teacherName}</strong>,</p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        You have received a new peer-learning session request on the Kaushalam platform. A fellow student is eager to learn from your expertise!
      </p>

      <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Learner:</strong> ${data.learnerName} (${data.course})</p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Contact:</strong> ${data.learnerEmail}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Topic/Skill:</strong> <span style="background: #ccfbf1; color: #0f766e; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${data.skill}</span></p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Requested Date & Time:</strong> ${data.scheduledDate} at ${data.scheduledTime}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Duration:</strong> ${data.duration} minutes</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #334155;"><strong>Learning Objective:</strong> <em>"${data.learningObjective}"</em></p>
      </div>

      <p style="font-size: 14px; color: #475569;">
        Please log into your <strong>Kaushalam Teacher Dashboard</strong> to review, approve, or reschedule this request.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Open Teacher Dashboard</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Kaushalam Campus Skill-Sharing Network · Student-to-Student Learning Ecosystem
      </p>
    </div>
  `;

  const text = `
    Kaushalam - New Session Request #${data.requestId}
    Hello ${data.teacherName},
    You have received a new peer learning session request from ${data.learnerName} (${data.course}).
    Skill: ${data.skill}
    Date: ${data.scheduledDate} at ${data.scheduledTime} (${data.duration} mins)
    Objective: ${data.learningObjective}
    Please log in to your Teacher Dashboard to approve or reject.
  `;

  return sendEmail({
    to: data.teacherEmail,
    recipientName: data.teacherName,
    subject,
    bodyHtml: html,
    bodyText: text,
    eventType: 'booking_requested'
  });
}

export async function sendSessionApprovedEmail(data: {
  learnerEmail: string;
  learnerName: string;
  teacherName: string;
  teacherEmail: string;
  skill: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  meetingLink?: string;
  teacherNotes?: string;
}) {
  const subject = `[Kaushalam Approved] Session Confirmed: ${data.skill} with ${data.teacherName}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 20px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">Session Approved!</h1>
        <p style="margin: 6px 0 0 0; color: #d1fae5; font-size: 14px;">Your peer learning booking is confirmed</p>
      </div>

      <p style="font-size: 16px; color: #1e293b;">Hello <strong>${data.learnerName}</strong>,</p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        Great news! <strong>${data.teacherName}</strong> has accepted your request to learn <strong>${data.skill}</strong>.
      </p>

      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 4px 0; font-size: 14px; color: #166534;"><strong>Mentor:</strong> ${data.teacherName} (${data.teacherEmail})</p>
        <p style="margin: 4px 0; font-size: 14px; color: #166534;"><strong>Topic:</strong> ${data.skill}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #166534;"><strong>Confirmed Date & Time:</strong> ${data.scheduledDate} at ${data.scheduledTime}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #166534;"><strong>Duration:</strong> ${data.duration} minutes</p>
        ${data.meetingLink ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #166534;"><strong>Meeting Link / Room:</strong> <a href="${data.meetingLink}" style="color: #047857; font-weight: 600;">${data.meetingLink}</a></p>` : ''}
        ${data.teacherNotes ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #166534;"><strong>Teacher's Note:</strong> <em>"${data.teacherNotes}"</em></p>` : ''}
      </div>

      <p style="font-size: 14px; color: #475569;">
        Please make sure to arrive on time with any questions or code samples prepared.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Go to Learner Dashboard</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Kaushalam Campus Skill-Sharing Network · Student-to-Student Learning Ecosystem
      </p>
    </div>
  `;

  const text = `
    Kaushalam - Session Approved!
    Hello ${data.learnerName},
    Your session with ${data.teacherName} for ${data.skill} on ${data.scheduledDate} at ${data.scheduledTime} (${data.duration} mins) has been confirmed!
    Meeting link: ${data.meetingLink || 'Check dashboard'}
  `;

  return sendEmail({
    to: data.learnerEmail,
    recipientName: data.learnerName,
    subject,
    bodyHtml: html,
    bodyText: text,
    eventType: 'booking_approved'
  });
}

export async function sendSessionRejectedEmail(data: {
  learnerEmail: string;
  learnerName: string;
  teacherName: string;
  skill: string;
  scheduledDate: string;
  scheduledTime: string;
  reason?: string;
}) {
  const subject = `[Kaushalam Update] Session Request Update: ${data.skill}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 20px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">Session Request Update</h1>
        <p style="margin: 6px 0 0 0; color: #ffe4e6; font-size: 14px;">Schedule unavailable</p>
      </div>

      <p style="font-size: 16px; color: #1e293b;">Hello <strong>${data.learnerName}</strong>,</p>
      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        We regret to inform you that <strong>${data.teacherName}</strong> is unable to take the session for <strong>${data.skill}</strong> on ${data.scheduledDate} at ${data.scheduledTime}.
      </p>

      ${data.reason ? `
        <div style="background: #fff1f2; border-left: 4px solid #f43f5e; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #9f1239;"><strong>Note from Mentor:</strong> "${data.reason}"</p>
        </div>
      ` : ''}

      <p style="font-size: 14px; color: #475569;">
        Don't worry! There are multiple verified student teachers available in our Teachers Directory. You can request a different time slot or book with another teacher.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Browse Other Teachers</a>
      </div>
    </div>
  `;

  const text = `
    Kaushalam - Session Update
    Hello ${data.learnerName},
    Your request for ${data.skill} with ${data.teacherName} could not be scheduled at this time. Reason: ${data.reason || 'Schedule conflict'}.
    Please choose another slot or mentor in the directory.
  `;

  return sendEmail({
    to: data.learnerEmail,
    recipientName: data.learnerName,
    subject,
    bodyHtml: html,
    bodyText: text,
    eventType: 'booking_rejected'
  });
}
