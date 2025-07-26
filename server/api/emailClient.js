import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const NO_REPLY_EMAIL = "no-reply@cinephoria.net"
const CONTACT_EMAIL = "contact@cinephoria.net"
const CONTACT_FORM_SENDER_EMAIL = "contact-form@cinephoria.net"

// async function sendEmail({to,subject,text,html,replyTo}){
//    const FROM = NO_REPLY_EMAIL

//    const msg = {
//       to: to,
//       from: FROM, 
//       subject: subject,
//       text: text || 'no text provided',
//       html: html ||'<strong>no html provided</strong>',
//    }
//    // if (replyTo) msg.replyTo = replyTo //sets an email to be replied to if the reciver tries to reply

//    try {
//       const response = await sgMail.send(msg);
//       console.log('Email sent successfully to:', to);
//       return response;
//    } catch (error) {
//       console.error('Error sending email:', error.response?.body || error.message);
//       throw error;
//    }
// }

// export async function sendWelcomeEmail(email,username) {
//    const subject = 'Welcome to Cinephoria!';
//    const text = `Hi ${username || 'there'},\n\nWelcome to Cinephoria! We're glad to have you with us.`;
//    const html = `<p>Hi ${username || 'there'},</p><p>Welcome to <strong>Cinephoria</strong>! We're glad to have you with us.</p>`;
//    const msg = {
//       to:email,
//       subject,
//       text,
//       html
//    }
//    return await sendNoReplyEmail(msg);
// }

export async function sendVerificationEmail(userEmail, verificationLink) {

   const msg = {
      to: userEmail,
      from: NO_REPLY_EMAIL,
      subject: 'Verify Your Cinephoria Account',
      html: `
         <h2>Welcome to Cinephoria!</h2>
         <p>Please verify your email address by clicking the button below:</p>
         <a href="${verificationLink}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;">Verify Email</a>
         <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
         <p>${verificationLink}</p>
      `,
      text: `Welcome to Cinephoria!\n\nPlease verify your email by visiting the link: ${verificationLink}`
   };

   try {
      const response = await sgMail.send(msg);
      console.log('Verification email sent');
      return response;
   } catch (error) {
      console.error('Error sending verification email:', error);
      return error
   }
}

export async function sendContactMessage({ name, email, subject, message }){
   const msg = {
      to: CONTACT_EMAIL,
      from: CONTACT_FORM_SENDER_EMAIL, 
      replyTo: email, 
      subject: `Contact Form: ${subject}`,
      text: message,
      html: `
      <div style="font-family: sans-serif;">
         <h2>New Contact Message</h2>
         <p><strong>From:</strong> ${name} (${email})</p>
         <p><strong>Subject:</strong> ${subject}</p>
         <p><strong>Message:</strong></p>
         <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
      `
   };

   try {
      const response = await sgMail.send(msg);
      console.log('Contact-form Email sent successfully to:', to, "on behalf of: ",replyTo);
      return response;
   } catch (error) {
      console.error('Error sending email to:', to, "on behalf of: ",replyTo,"Error :", error.response?.body || error.message);
      throw error;
   }

}