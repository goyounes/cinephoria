import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendNoReplyEmail({to,subject,text,html,replyTo}){
    const FROM = 'no-reply@cinephoria.net'

    const msg = {
        to: to,
        from: FROM, 
        subject: subject,
        text: text || 'no text provided',
        html: html ||'<strong>no html provided</strong>',
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
    const msg = {
        to:email,
        subject,
        text,
        html
    }
    return await sendNoReplyEmail(msg);
}

export async function sendVerificationEmail(userEmail, verificationLink) {
    const subject = 'Verify Your Cinephoria Account'
    const html= `
        <h2>Welcome to Cinephoria!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationLink}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;">Verify Email</a>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p>${verificationLink}</p>
    `
    const text = html

    const msg = {
        to: userEmail,
        subject,
        text,
        html,
    }

  try {
    await sendNoReplyEmail(msg);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}