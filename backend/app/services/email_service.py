import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from flask import current_app
from backend.app.models import db, NotificationOutbox

def send_notification_email(recipient_email, recipient_name, subject, body_html, body_text, event_type):
    """
    Sends real outgoing email using configured SMTP settings.
    Records delivery attempt into NotificationOutbox for non-repudiation and reliable diagnostics.
    Does not crash booking workflow if SMTP is temporarily unconfigured or unreachable.
    """
    # 1. Log to outbox table
    outbox_entry = NotificationOutbox(
        recipient_email=recipient_email,
        recipient_name=recipient_name,
        subject=subject,
        body_html=body_html,
        body_text=body_text,
        event_type=event_type,
        status="queued"
    )
    db.session.add(outbox_entry)
    db.session.commit()

    mail_server = current_app.config.get("MAIL_SERVER")
    mail_port = current_app.config.get("MAIL_PORT", 587)
    mail_user = current_app.config.get("MAIL_USERNAME")
    mail_password = current_app.config.get("MAIL_PASSWORD")
    sender = current_app.config.get("MAIL_DEFAULT_SENDER") or mail_user

    if not mail_server or not mail_user or not mail_password:
        msg = f"[SMTP Notice] Outgoing email to {recipient_email} queued in database (SMTP credentials unconfigured in environment)."
        print(msg)
        return True, outbox_entry.id, msg

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = recipient_email

        part1 = MIMEText(body_text, "plain")
        part2 = MIMEText(body_html, "html")
        msg.attach(part1)
        msg.attach(part2)

        if current_app.config.get("MAIL_USE_TLS", True):
            server = smtplib.SMTP(mail_server, mail_port)
            server.ehlo()
            server.starttls()
            server.ehlo()
        else:
            server = smtplib.SMTP_SSL(mail_server, mail_port)

        server.login(mail_user, mail_password)
        server.sendmail(sender, [recipient_email], msg.as_string())
        server.quit()

        outbox_entry.status = "sent"
        outbox_entry.sent_at = datetime.utcnow()
        db.session.commit()
        return True, outbox_entry.id, "Sent successfully via SMTP"
    except Exception as e:
        safe_err = str(e)
        print(f"[SMTP Error] Failed sending to {recipient_email}: {safe_err}")
        outbox_entry.status = "failed"
        outbox_entry.error_message = safe_err
        db.session.commit()
        return False, outbox_entry.id, safe_err
