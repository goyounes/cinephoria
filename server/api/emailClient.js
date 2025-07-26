import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({to,subject,text,html,replyTo}){
    const msg = {
        to: to,
        from: 'no-reply@cinephoria.net', 
        subject: subject,
        text: text || 'This is a text version',
        html: html ||'<strong>This is a html version</strong>',
    }
    // if (replyTo) msg.replyTo = replyTo //sets an email to be replied to if the reciver tries to reply

    try {
        const response = await sgMail.send(msg);
        console.log('Email sent successfully to:', to);
        return response;
    } catch (error) {
        console.error('Error sending email:', error.response?.body || error.message);
        throw error;
    }
}

export async function sendWelcomeEmail(email,username) {
  const subject = 'Welcome to Cinephoria!';
  const text = `Hi ${username || 'there'},\n\nWelcome to Cinephoria! We're glad to have you with us.`;
  const html = `<p>Hi ${username || 'there'},</p><p>Welcome to <strong>Cinephoria</strong>! We're glad to have you with us.</p>`;

  return await sendEmail({to:email, subject, text, html});
}