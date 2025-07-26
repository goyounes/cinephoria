import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const NO_REPLY_EMAIL = "no-reply@cinephoria.net"
const CONTACT_EMAIL = "contact@cinephoria.net"
const CONTACT_FORM_SENDER_EMAIL = "contact-form@cinephoria.net"

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
      console.log('Contact-form Email sent successfully to:', CONTACT_EMAIL, "on behalf of: ",email);
      return response;
   } catch (error) {
      console.error('Error sending email to:', CONTACT_EMAIL, "on behalf of: ",email,"Error :", error.response?.body || error.message);
      throw error;
   }

}

export async function sendContactAcknowledgment({ name, email, subject, message }) {
  const msg = {
    to: email,
    from: NO_REPLY_EMAIL,
    subject: `We've received your message - Cinephoria`,
    text: `Hi ${name},

      Thanks for contacting Cinephoria. We've received your message regarding "${subject}" and our team will get back to you shortly.

      ---
      Copy of your message:
      ${message}

      - The Cinephoria Team`,
     html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
         <p>Hi ${name},</p>
         <p>Thanks for contacting <strong>Cinephoria</strong>. We've received your message regarding <strong>${subject}</strong>, and our team will respond as soon as possible.</p>
         <p>If you have more to share, feel free to reach out at <a href="mailto:support@cinephoria.net">support@cinephoria.net</a>.</p>
         <p>- The Cinephoria Team</p>

         <hr>
         <div style="font-size: 0.85em; color: #666; margin-top: 20px;">
           <p><strong>Copy of your message:</strong></p>
           <p style="white-space: pre-line;">${message.replace(/\n/g, "<br>")}</p>
         </div>

         <hr>
         <p style="font-size: 0.75em; color: #999;">
           This is an automated message from an unmonitored inbox. Please do not reply to this email.
         </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Acknowledgment email sent to user: ${email}`);
  } catch (error) {
    console.error(`Failed to send acknowledgment email to ${email}:`, error.response?.body || error.message);
    // Don't rethrow – main contact message was already sent
  }
}