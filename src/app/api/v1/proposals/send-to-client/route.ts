import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Email sending schema
const SendToClientSchema = z.object({
  proposalId: z.string().uuid(),
  clientEmail: z.string().email(),
  clientName: z.string().min(1),
  projectTitle: z.string().min(1),
  message: z.string().optional(),
  includeAttachment: z.boolean().default(true),
});

/**
 * Send proposal to client via email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposalId, clientEmail, clientName, projectTitle, message, includeAttachment } = SendToClientSchema.parse(body);

    // In a real implementation, you would:
    // 1. Fetch the proposal from database
    // 2. Generate PDF if includeAttachment is true
    // 3. Send email using a service like SendGrid, Resend, or Nodemailer
    // 4. Log the email send event
    
    // For now, we'll simulate the email sending process
    await simulateEmailSend({
      proposalId,
      clientEmail,
      clientName,
      projectTitle,
      message,
      includeAttachment,
    });

    return NextResponse.json({
      success: true,
      message: 'Proposal sent to client successfully',
      sentAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Send to client error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send proposal to client' },
      { status: 500 }
    );
  }
}

/**
 * Simulate email sending process
 * In production, replace this with actual email service integration
 */
async function simulateEmailSend({
  proposalId,
  clientEmail,
  clientName,
  projectTitle,
  message,
  includeAttachment,
}: {
  proposalId: string;
  clientEmail: string;
  clientName: string;
  projectTitle: string;
  message?: string;
  includeAttachment: boolean;
}) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Log the email details (in production, this would be actual email sending)
  console.log('📧 Email sent successfully:', {
    to: clientEmail,
    subject: `Proposal: ${projectTitle}`,
    proposalId,
    clientName,
    includeAttachment,
    customMessage: message,
    timestamp: new Date().toISOString(),
  });

  // In a real implementation, you would integrate with an email service:
  /*
  const emailService = new EmailService(); // e.g., SendGrid, Resend, etc.
  
  await emailService.send({
    to: clientEmail,
    subject: `Proposal: ${projectTitle}`,
    html: generateEmailTemplate({
      clientName,
      projectTitle,
      message,
      proposalId,
    }),
    attachments: includeAttachment ? [
      {
        filename: `${projectTitle.replace(/\s+/g, '_')}_Proposal.pdf`,
        content: await generateProposalPDF(proposalId),
      }
    ] : [],
  });
  */
}

/**
 * Generate email template for proposal
 */
function generateEmailTemplate({
  clientName,
  projectTitle,
  message,
  proposalId,
}: {
  clientName: string;
  projectTitle: string;
  message?: string;
  proposalId: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Proposal: ${projectTitle}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; color: #6c757d; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Project Proposal</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${projectTitle}</p>
        </div>
        
        <div class="content">
          <p>Dear ${clientName},</p>
          
          <p>I hope this email finds you well. Please find attached our detailed proposal for the <strong>${projectTitle}</strong> project.</p>
          
          ${message ? `<div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="margin: 0;"><strong>Personal Message:</strong></p>
            <p style="margin: 10px 0 0 0;">${message}</p>
          </div>` : ''}
          
          <p>This proposal includes:</p>
          <ul>
            <li>Executive Summary</li>
            <li>Project Scope & Requirements</li>
            <li>Timeline & Milestones</li>
            <li>Budget Breakdown</li>
            <li>Terms & Conditions</li>
          </ul>
          
          <p>We're excited about the opportunity to work with you on this project. Please review the proposal and don't hesitate to reach out if you have any questions or would like to discuss any aspects in detail.</p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/proposals/share/${proposalId}" class="button">View Online Proposal</a>
          </p>
          
          <p>Looking forward to hearing from you soon.</p>
          
          <p>Best regards,<br>
          <strong>GGH Software Development Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This proposal was generated using GGH Proposal AI</p>
          <p>© ${new Date().getFullYear()} GGH Software Development Services</p>
        </div>
      </div>
    </body>
    </html>
  `;
}