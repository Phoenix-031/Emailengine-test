/* eslint-disable @typescript-eslint/no-explicit-any */
interface EmailRecipient {
  email: string;
  name?: string;
  [key: string]: any;
}


// async function sendBulkEmails(
//   recipients: EmailRecipient[],
//   subject: string,
//   body: string,
//   htmlBody?: string,
//   senderEmail?: string
// ): Promise<{ success: boolean; error?: string; results?: any }> {
//   const emailEngineBaseUrl = process.env.EMAIL_ENGINE_BASE_URL;
//   const emailEngineAccessToken = process.env.EMAIL_ENGINE_API_KEY;
  
//   // Use provided sender email or default (should be configured in your system)
//   const fromAddress = senderEmail || 'your-default-sender@example.com';
  
// //   const RETRY_LIMIT = 1;

//   try {
//     const emailPromises = recipients.map(async (recipient) => {
//     //   let counter = 0;

//     //   while (counter < RETRY_LIMIT) {
//         try {
//           // Skip if trying to send to same address (safety check)
//           if (fromAddress === recipient.email) {
//             return { success: false, email: recipient.email, reason: 'Same sender and recipient' };
//           }

//           // Check if it's a Microsoft domain to determine payload structure
//           const isMicrosoftDomain = /@(hotmail|outlook)\.com$/i.test(fromAddress);

//           const payload: any = {
//             to: [
//               {
//                 address: recipient.email,
//               },
//             ],
//             subject: subject,
//             text: body,
//             html: htmlBody || body.replace(/\n/g, '<br>'), // Convert text to HTML if no HTML provided
//             trackOpens: true,
//           };

//           // Set from/gateway based on email domain
//           if (isMicrosoftDomain) {
//             payload.from = {
//               address: fromAddress,
//             };
//           } else {
//             payload.gateway = fromAddress;
//           }

//           const response = await fetch(
//             `${emailEngineBaseUrl}/v1/account/${fromAddress}/submit?access_token=${emailEngineAccessToken}`,
//             {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify(payload),
//             }
//           );

//           const data = await response.json();

//           console.log(`Email result for ${recipient.email}:`, data, response.status);

//           if (response.ok) {
//             return { 
//               success: true, 
//               email: recipient.email, 
//               messageId: data.messageId,
//               queueId: data.queueId,
//               sentAt: data.sentAt
//             };
//           } else {
//             // If not the last retry, continue to next iteration
//             // if (counter < RETRY_LIMIT - 1) {
//             //   counter++;
//             //   continue;
//             // }
//             return { 
//               success: false, 
//               email: recipient.email, 
//               error: data.error || 'Unknown error',
//               status: response.status
//             };
//           }
//         } catch (error) {
//           console.error(`Attempt failed for ${recipient.email}:`, error);
          
//         //   if (counter === RETRY_LIMIT - 1) {
//         //     return { 
//         //       success: false, 
//         //       email: recipient.email, 
//         //       error: String(error)
//         //     };
//         //   } else {
//         //     counter++;
//         //   }
//         }
//     //   }
//     });

//     const results = await Promise.all(emailPromises);
//     const successfulSends = results.filter(result => result.success);
//     const failedSends = results.filter(result => !result.success);

//     console.log(`Bulk email results: ${successfulSends.length} successful, ${failedSends.length} failed`);

//     return { 
//       success: successfulSends.length > 0, 
//       results: {
//         total: results.length,
//         successful: successfulSends.length,
//         failed: failedSends.length,
//         details: results
//       }
//     };
//   } catch (error) {
//     console.error('Error sending bulk emails:', error);
//     return { success: false, error: String(error) };
//   }
// }

// async function sendBulkEmails(
//   recipients: EmailRecipient[],
//   subject: string,
//   body: string,
//   htmlBody?: string,
//   senderEmails?: string[]
// ): Promise<{ success: boolean; error?: string; results?: any }> {
//   const emailEngineBaseUrl = process.env.EMAIL_ENGINE_BASE_URL;
//   const emailEngineAccessToken = process.env.EMAIL_ENGINE_API_KEY;

//   if (!senderEmails || senderEmails.length === 0) {
//     return {
//       success: false,
//       error: 'No sender emails provided',
//     };
//   }

//   try {
//     const emailPromises = recipients.map(async (recipient, index) => {
//       try {
//         // Round-robin sender selection
//         const fromAddress = senderEmails[index % senderEmails.length];

//         // Safety check: skip if sender and recipient are the same
//         if (fromAddress === recipient.email) {
//           return {
//             success: false,
//             email: recipient.email,
//             reason: 'Same sender and recipient',
//             sender: fromAddress,
//           };
//         }

//         const isMicrosoftDomain = /@(hotmail|outlook)\.com$/i.test(fromAddress);

//         const payload: any = {
//           to: [{ address: recipient.email }],
//           subject,
//           text: body,
//           html: htmlBody || body.replace(/\n/g, '<br>'),
//           trackOpens: true,
//         };

//         if (isMicrosoftDomain) {
//           payload.from = { address: fromAddress };
//         } else {
//           payload.gateway = fromAddress;
//         }

//         const response = await fetch(
//           `${emailEngineBaseUrl}/v1/account/${fromAddress}/submit?access_token=${emailEngineAccessToken}`,
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//           }
//         );

//         const data = await response.json();
//         console.log(`Email result for ${recipient.email}:`, data, response.status);

//         if (response.ok) {
//           return {
//             success: true,
//             email: recipient.email,
//             sender: fromAddress,
//             messageId: data.messageId,
//             queueId: data.queueId,
//             sentAt: data.sentAt,
//           };
//         } else {
//           return {
//             success: false,
//             email: recipient.email,
//             sender: fromAddress,
//             error: data.error || 'Unknown error',
//             status: response.status,
//           };
//         }
//       } catch (error) {
//         console.error(`Attempt failed for ${recipient.email}:`, error);
//         return {
//           success: false,
//           email: recipient.email,
//           sender: senderEmails[index % senderEmails.length],
//           error: String(error),
//         };
//       }
//     });

//     const results = await Promise.all(emailPromises);
//     const successfulSends = results.filter(r => r.success);
//     const failedSends = results.filter(r => !r.success);

//     console.log(`Bulk email results: ${successfulSends.length} successful, ${failedSends.length} failed`);

//     return {
//       success: successfulSends.length > 0,
//       results: {
//         total: results.length,
//         successful: successfulSends.length,
//         failed: failedSends.length,
//         details: results,
//       },
//     };
//   } catch (error) {
//     console.error('Error sending bulk emails:', error);
//     return { success: false, error: String(error) };
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { recipients, subject, body: emailBody, htmlBody, senderEmails } = body;
//     console.log("TE BODY", body)

//     if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
//       return Response.json({ error: 'No recipients provided' }, { status: 400 });
//     }

//     if (!subject || !emailBody) {
//       return Response.json({ error: 'Subject and body are required' }, { status: 400 });
//     }

//     if (!senderEmails) {
//       return Response.json({ error: 'Sender email is required' }, { status: 400 });
//     }

//     const result = await sendBulkEmails(recipients, subject, emailBody, htmlBody, senderEmails);
    
//     if (result.success) {
//       return Response.json({
//         success: true,
//         message: `Successfully processed ${result.results?.total} emails`,
//         results: result.results
//       });
//     } else {
//       return Response.json({
//         success: false,
//         error: result.error,
//         results: result.results
//       }, { status: 400 });
//     }
//   } catch (error) {
//     console.error('API Error:', error);
//     return Response.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// async function sendBulkEmails(
//   recipients: EmailRecipient[],
//   steps: {
//     subject: string;
//     body: string;
//     html?: string;
//     delayMinutes: number;
//   }[],
//   senderEmails?: string[]
// ): Promise<{ success: boolean; error?: string; results?: any }> {
//   const emailEngineBaseUrl = process.env.EMAIL_ENGINE_BASE_URL;
//   const emailEngineAccessToken = process.env.EMAIL_ENGINE_API_KEY;

//   if (!senderEmails || senderEmails.length === 0) {
//     return {
//       success: false,
//       error: 'No sender emails provided',
//     };
//   }

//   const allResults: any[] = [];

//   for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
//     const step = steps[stepIndex];

//     // Delay between steps (except the first one)
//     if (stepIndex > 0 && step.delayMinutes > 0) {
//       await new Promise((resolve) => setTimeout(resolve, step.delayMinutes * 60 * 1000));
//     }

//     const emailPromises = recipients.map(async (recipient, index) => {
//       try {
//         const fromAddress = senderEmails[index % senderEmails.length];

//         if (fromAddress === recipient.email) {
//           return {
//             success: false,
//             email: recipient.email,
//             reason: 'Same sender and recipient',
//             sender: fromAddress,
//           };
//         }

//         const isMicrosoftDomain = /@(hotmail|outlook)\.com$/i.test(fromAddress);

//         const payload: any = {
//           to: [{ address: recipient.email }],
//           subject: step.subject,
//           text: step.body,
//           html: step.html || step.body.replace(/\n/g, '<br>'),
//           trackOpens: true,
//         };

//         if (isMicrosoftDomain) {
//           payload.from = { address: fromAddress };
//         } else {
//           payload.gateway = fromAddress;
//         }

//         const response = await fetch(
//           `${emailEngineBaseUrl}/v1/account/${fromAddress}/submit?access_token=${emailEngineAccessToken}`,
//           {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//           }
//         );

//         const data = await response.json();
//         console.log(`Email result for ${recipient.email} (Step ${stepIndex + 1}):`, data, response.status);

//         if (response.ok) {
//           return {
//             success: true,
//             email: recipient.email,
//             sender: fromAddress,
//             step: stepIndex + 1,
//             messageId: data.messageId,
//             queueId: data.queueId,
//             sentAt: data.sentAt,
//           };
//         } else {
//           return {
//             success: false,
//             email: recipient.email,
//             sender: fromAddress,
//             step: stepIndex + 1,
//             error: data.error || 'Unknown error',
//             status: response.status,
//           };
//         }
//       } catch (error) {
//         console.error(`Attempt failed for ${recipient.email} (Step ${stepIndex + 1}):`, error);
//         return {
//           success: false,
//           email: recipient.email,
//           sender: senderEmails[index % senderEmails.length],
//           step: stepIndex + 1,
//           error: String(error),
//         };
//       }
//     });

//     const stepResults = await Promise.all(emailPromises);
//     allResults.push(...stepResults);
//   }

//   const successfulSends = allResults.filter((r) => r.success);
//   const failedSends = allResults.filter((r) => !r.success);

//   return {
//     success: successfulSends.length > 0,
//     results: {
//       total: allResults.length,
//       successful: successfulSends.length,
//       failed: failedSends.length,
//       details: allResults,
//     },
//   };
// }

async function sendBulkEmails(
  recipients: EmailRecipient[],
  steps: {
    subject: string;
    body: string;
    html?: string;
    sendAfter: { hours: number; minutes: number };
  }[],
  senderEmails?: string[]
): Promise<{ success: boolean; error?: string; results?: any }> {
  const emailEngineBaseUrl = process.env.EMAIL_ENGINE_BASE_URL;
  const emailEngineAccessToken = process.env.EMAIL_ENGINE_API_KEY;

  if (!senderEmails || senderEmails.length === 0) {
    return {
      success: false,
      error: 'No sender emails provided',
    };
  }

  const allResults: any[] = [];

  for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
    const step = steps[stepIndex];
    console.log(`🚀 Sending step ${stepIndex + 1} to all recipients...`);

    const emailPromises = recipients.map(async (recipient, recipientIndex) => {
      try {
        const fromAddress = senderEmails[recipientIndex % senderEmails.length];

        if (fromAddress === recipient.email) {
          return {
            success: false,
            email: recipient.email,
            reason: 'Same sender and recipient',
            sender: fromAddress,
            step: stepIndex + 1,
          };
        }

        const isMicrosoftDomain = /@(hotmail|outlook)\.com$/i.test(fromAddress);

        const payload: any = {
          to: [{ address: recipient.email }],
          subject: step.subject,
          text: step.body,
          html: step.html || step.body.replace(/\n/g, '<br>'),
          trackOpens: true,
        };

        if (isMicrosoftDomain) {
          payload.from = { address: fromAddress };
        } else {
          payload.gateway = fromAddress;
        }

        const response = await fetch(
          `${emailEngineBaseUrl}/v1/account/${fromAddress}/submit?access_token=${emailEngineAccessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();

        return {
          success: response.ok,
          email: recipient.email,
          sender: fromAddress,
          step: stepIndex + 1,
          ...(response.ok
            ? {
                messageId: data.messageId,
                queueId: data.queueId,
                sentAt: data.sentAt,
              }
            : {
                error: data.error || 'Unknown error',
                status: response.status,
              }),
        };
      } catch (error) {
        console.error(`Error sending to ${recipient.email} (Step ${stepIndex + 1}):`, error);
        return {
          success: false,
          email: recipient.email,
          sender: senderEmails[recipientIndex % senderEmails.length],
          step: stepIndex + 1,
          error: String(error),
        };
      }
    });

    const stepResults = await Promise.all(emailPromises);
    allResults.push(...stepResults);

    // ⏳ Wait before next step (only if not the last step)
if (stepIndex < steps.length - 1) {
  const nextStepDelay = steps[stepIndex + 1].sendAfter;
  const totalDelayMs = (nextStepDelay.hours * 60 + nextStepDelay.minutes) * 60 * 1000;

  if (totalDelayMs > 0) {
    console.log(
      `⏳ Waiting ${nextStepDelay.hours}h ${nextStepDelay.minutes}m before sending step ${stepIndex + 2}...`
    );
    await new Promise((resolve) => setTimeout(resolve, totalDelayMs));
  }
}

  }

  const successfulSends = allResults.filter((r) => r.success);
  const failedSends = allResults.filter((r) => !r.success);

  return {
    success: successfulSends.length > 0,
    results: {
      total: allResults.length,
      successful: successfulSends.length,
      failed: failedSends.length,
      details: allResults,
    },
  };
}



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipients, steps, senderEmails } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return Response.json({ error: 'No recipients provided' }, { status: 400 });
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      return Response.json({ error: 'No email steps provided' }, { status: 400 });
    }

    if (!senderEmails || !Array.isArray(senderEmails) || senderEmails.length === 0) {
      return Response.json({ error: 'Sender email is required' }, { status: 400 });
    }

    console.log("THE STEPS", steps)

    const result = await sendBulkEmails(recipients, steps, senderEmails);

    if (result.success) {
      return Response.json({
        success: true,
        message: `Successfully processed ${result.results?.total} emails`,
        results: result.results,
      });
    } else {
      return Response.json(
        {
          success: false,
          error: result.error,
          results: result.results,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}