import sgMail from '@sendgrid/mail';

// SendGrid API key configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@lostlink.app';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully');
  console.log(`📧 FROM_EMAIL configured: ${FROM_EMAIL}`);
  console.log(`⚠️ IMPORTANT: Ensure ${FROM_EMAIL} is verified in SendGrid Dashboard`);
  console.log(`   Go to: Settings → Sender Authentication → Single Sender Verification`);
} else {
  console.warn('⚠️ SENDGRID_API_KEY not found - email functionality disabled');
}

/**
 * Send claim notification email
 * @param {string} itemOwnerEmail - Item owner's email address
 * @param {Object} item - Item information
 * @param {Object} claim - Claim information
 * @param {string} claimerEmail - Claimer's email address (optional)
 */
export async function sendClaimNotificationEmail(itemOwnerEmail, item, claim, claimerEmail = null) {
  // Always use real SendGrid (Mock mode removed)
  if (!SENDGRID_API_KEY) {
    console.log('📧 Email sending skipped - SendGrid not configured');
    return { success: false, reason: 'SendGrid not configured' };
  }

  try {
    const subject = `🔔 Someone claimed your found item: ${item.title}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Someone wants to claim your found item!</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0;">Item Details:</h3>
          <p><strong>Title:</strong> ${item.title}</p>
          <p><strong>Location:</strong> ${item.location}</p>
          ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ''}
        </div>

        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <h3 style="color: #1f2937; margin-top: 0;">Claim Message:</h3>
          <p style="font-style: italic; color: #374151;">"${claim.message}"</p>
          ${claimerEmail ? `<p><strong>Claimer's email:</strong> ${claimerEmail}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date(claim.createdAt).toLocaleString()}</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
          <h4 style="color: #92400e; margin-top: 0;">Next Steps:</h4>
          <ol style="color: #92400e;">
            <li>Review the claim message carefully</li>
            <li>Contact the claimer if their details seem legitimate</li>
            <li>Ask them to provide additional proof of ownership</li>
            <li>Arrange a safe meeting place for item return</li>
          </ol>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>This email was sent by LostLink - Connecting lost items with their owners</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `;

    const textContent = `
Someone wants to claim your found item!

Item: ${item.title}
Location: ${item.location}
${item.description ? `Description: ${item.description}` : ''}

Claim Message: "${claim.message}"
${claimerEmail ? `Claimer's email: ${claimerEmail}` : ''}
Submitted: ${new Date(claim.createdAt).toLocaleString()}

Next Steps:
1. Review the claim message carefully
2. Contact the claimer if their details seem legitimate  
3. Ask them to provide additional proof of ownership
4. Arrange a safe meeting place for item return

---
This email was sent by LostLink - Connecting lost items with their owners
    `;

    const msg = {
      to: itemOwnerEmail,
      from: FROM_EMAIL,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    console.log(`📧 Sending claim notification email to: ${itemOwnerEmail} via SendGrid`);
    console.log(`📧 From: ${FROM_EMAIL}`);
    const startTime = Date.now();
    
    const response = await sgMail.send(msg);
    
    const endTime = Date.now();
    const deliveryTime = endTime - startTime;
    
    // Log detailed SendGrid response
    console.log(`📧 SendGrid Response Status: ${response[0]?.statusCode || 'unknown'}`);
    console.log(`📧 SendGrid Response Headers:`, JSON.stringify(response[0]?.headers || {}, null, 2));
    console.log(`📧 SendGrid Response Body:`, JSON.stringify(response[0]?.body || {}, null, 2));
    
    // Check if email was actually accepted
    const statusCode = response[0]?.statusCode;
    const isSuccess = statusCode >= 200 && statusCode < 300;
    
    if (isSuccess) {
      console.log(`✅ SendGrid email accepted (status: ${statusCode}) in ${deliveryTime}ms`);
      console.log(`📧 Note: Check SendGrid dashboard to verify actual delivery`);
    } else {
      console.warn(`⚠️ SendGrid returned non-success status: ${statusCode}`);
    }
    
    return { 
      success: isSuccess, 
      deliveryTime,
      recipient: itemOwnerEmail,
      subject,
      service: 'SendGrid',
      statusCode: statusCode,
      response: response[0]?.body || null
    };

  } catch (error) {
    console.error('❌ Failed to send email:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // SendGrid specific error handling
    if (error.response) {
      console.error('❌ SendGrid Error Status:', error.response.statusCode);
      console.error('❌ SendGrid Error Headers:', JSON.stringify(error.response.headers || {}, null, 2));
      console.error('❌ SendGrid Error Body:', JSON.stringify(error.response.body || {}, null, 2));
      
      // Common SendGrid errors
      if (error.response.body?.errors) {
        error.response.body.errors.forEach((err, idx) => {
          console.error(`❌ SendGrid Error ${idx + 1}:`, err.message);
          console.error(`   Field: ${err.field || 'N/A'}, Help: ${err.help || 'N/A'}`);
        });
      }
    }
    
    // Check for common issues
    if (error.message?.includes('sender')) {
      console.error('⚠️ Possible issue: FROM_EMAIL not verified in SendGrid');
      console.error('   Solution: Verify sender email in SendGrid Dashboard → Settings → Sender Authentication');
    }
    
    return { 
      success: false, 
      error: error.message,
      statusCode: error.response?.statusCode,
      details: error.response?.body,
      errors: error.response?.body?.errors || []
    };
  }
}

/**
 * Send claim status update notification email
 * @param {string} claimerEmail - Claimer's email address
 * @param {Object} item - Item information
 * @param {Object} claim - Claim information
 * @param {string} status - New status ('approved' or 'rejected')
 */
export async function sendClaimStatusUpdateEmail(claimerEmail, item, claim, status) {
  if (!SENDGRID_API_KEY || !claimerEmail) {
    return { success: false, reason: 'SendGrid not configured or no claimer email' };
  }

  try {
    const isApproved = status === 'approved';
    const subject = `📬 Your claim has been ${isApproved ? 'approved' : 'rejected'}: ${item.title}`;
    
    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const statusBg = isApproved ? '#ecfdf5' : '#fef2f2';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: ${statusColor};">Your claim has been ${status}!</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Item Details:</h3>
          <p><strong>Title:</strong> ${item.title}</p>
          <p><strong>Location:</strong> ${item.location}</p>
        </div>

        <div style="background-color: ${statusBg}; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusColor};">
          <h3 style="margin-top: 0;">Status Update:</h3>
          <p><strong>Your claim:</strong> "${claim.message}"</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
          <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        ${isApproved ? `
          <div style="margin-top: 20px; padding: 20px; background-color: #dbeafe; border-radius: 8px;">
            <h4 style="color: #1d4ed8; margin-top: 0;">🎉 Great news!</h4>
            <p>The item owner has approved your claim. They should contact you soon to arrange the return.</p>
            <p style="font-weight: bold;">Please be ready to provide additional proof of ownership when you meet.</p>
          </div>
        ` : `
          <div style="margin-top: 20px; padding: 20px; background-color: #fee2e2; border-radius: 8px;">
            <h4 style="color: #dc2626; margin-top: 0;">Claim rejected</h4>
            <p>Unfortunately, the item owner has rejected your claim. This could be because:</p>
            <ul style="color: #dc2626;">
              <li>The description didn't match their item</li>
              <li>They need more specific details</li>
              <li>The item was already returned to someone else</li>
            </ul>
            <p>If you believe this is your item, you can submit a new claim with more detailed information.</p>
          </div>
        `}

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>This email was sent by LostLink</p>
        </div>
      </div>
    `;

    const msg = {
      to: claimerEmail,
      from: FROM_EMAIL,
      subject: subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`✅ Status update email sent to claimer: ${claimerEmail}`);
    
    return { success: true };

  } catch (error) {
    console.error('❌ Failed to send status update email:', error);
    return { success: false, error: error.message };
  }
}

export default sgMail; 