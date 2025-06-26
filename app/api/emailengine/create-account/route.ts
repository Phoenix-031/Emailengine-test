/* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextApiRequest, NextApiResponse } from "next";

// const PROVIDER_TYPES = {
//   GMAIL: 'gmail',
//   MICROSOFT: 'microsoft',
// };

// async function createEmailEngineIntegrations(
//   credential: any,
//   rawPassword: string,
//   provider: string
// ): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
//   const emailEngineBaseUrl = process.env.EMAIL_ENGINE_BASE_URL;
//   const emailEngineAccessToken = process.env.EMAIL_ENGINE_API_KEY;
//   const isMicrosoft = provider === PROVIDER_TYPES.MICROSOFT;

//   try {
//     const accountRequestBody = isMicrosoft
//       ? {
//           account: credential.emailId,
//           name: credential.emailId.split('@')[0],
//           email: credential.emailId,
//           oauth2: {
//             authorize: true,
//             redirectUrl: process.env.EMAIL_ENGINE_MICROSOFT_REDIRECT_URL,
//             provider: process.env.EMAIL_ENGINE_MICROSOFT_PROVIDER_ID,
//           },
//         }
//       : {
//           account: credential.emailId,
//           name: credential.emailId.split('@')[0],
//           email: credential.emailId,
//           imap: {
//             auth: {
//               user: credential.emailId,
//               pass: rawPassword,
//             },
//             host: credential.providerIMAPHost || 'imap.gmail.com',
//             port: credential.providerIMAPPort || 993,
//             secure: true,
//           },
//           smtp: {
//             auth: {
//               user: credential.emailId,
//               pass: rawPassword,
//             },
//             host: credential.providerSMTPHost || 'smtp.gmail.com',
//             port: credential.providerSMTPPort || 587,
//             secure: true,
//           },
//         };

//     const accountResponse = await fetch(
//       `${emailEngineBaseUrl}/v1/account?access_token=${emailEngineAccessToken}`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(accountRequestBody),
//       }
//     );

//     if (!accountResponse.ok) {
//       const errorData = await accountResponse.json();
//       console.error('Email engine account creation failed:', errorData);
//       return { success: false, error: 'Account creation failed' };
//     }

//     const accountData = await accountResponse.json();

//     if (isMicrosoft) {
//       if (accountData.redirect) {
//         return { success: true, redirectUrl: accountData.redirect };
//       }
//       return {
//         success: false,
//         error: 'Missing redirect URL for Microsoft account',
//       };
//     }

//     const gatewayRequestBody = {
//       name: provider === PROVIDER_TYPES.GMAIL ? 'Gmail' : 'Other',
//       gateway: credential.emailId,
//       user: credential.emailId,
//       pass: rawPassword,
//       host: credential.providerSMTPHost || 'smtp.gmail.com',
//       port: credential.providerSMTPPort || 587,
//     };

//     const gatewayResponse = await fetch(
//       `${emailEngineBaseUrl}/v1/gateway?access_token=${emailEngineAccessToken}`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(gatewayRequestBody),
//       }
//     );

//     if (!gatewayResponse.ok) {
//       const errorData = await gatewayResponse.json();
//       console.error('Email engine gateway creation failed:', errorData);
//       return { success: false, error: 'Gateway creation failed' };
//     }

//     const gatewayData = await gatewayResponse.json();

//     if (accountData.account && gatewayData.gateway) {
//       return { success: true };
//     }

//     return { success: false, error: 'Incomplete email engine configuration' };
//   } catch (error) {
//     console.error('Error connecting to email engine:', error);
//     return { success: false, error: String(error) };
//   }
// }

// async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const { credential, provider } = req.body;

//     if (!credential || !credential.emailId || !credential.password) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const result = await createEmailEngineIntegrations(
//       credential,
//       credential.password,
//       provider
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     console.error('API Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// export {handler as POST}

import { NextRequest, NextResponse } from 'next/server';

const PROVIDER_TYPES = {
  GMAIL: 'gmail',
  MICROSOFT: 'microsoft',
};

async function createEmailEngineIntegrations(
  credential: any,
  rawPassword: string,
  provider: string
): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  const emailEngineBaseUrl = process.env.EMAIL_ENGINE_BASE_URL;
  const emailEngineAccessToken = process.env.EMAIL_ENGINE_API_KEY;
  const isMicrosoft = provider === PROVIDER_TYPES.MICROSOFT;

  try {
    const accountRequestBody = isMicrosoft
      ? {
          account: credential.emailId,
          name: credential.emailId.split('@')[0],
          email: credential.emailId,
          oauth2: {
            authorize: true,
            redirectUrl: process.env.EMAIL_ENGINE_MICROSOFT_REDIRECT_URL,
            provider: process.env.EMAIL_ENGINE_MICROSOFT_PROVIDER_ID,
          },
        }
      : {
          account: credential.emailId,
          name: credential.emailId.split('@')[0],
          email: credential.emailId,
          imap: {
            auth: {
              user: credential.emailId,
              pass: rawPassword,
            },
            host: credential.providerIMAPHost || 'imap.gmail.com',
            port: credential.providerIMAPPort || 993,
            secure: true,
          },
          smtp: {
            auth: {
              user: credential.emailId,
              pass: rawPassword,
            },
            host: credential.providerSMTPHost || 'smtp.gmail.com',
            port: credential.providerSMTPPort || 587,
            secure: true,
          },
        };

    const accountResponse = await fetch(
      `${emailEngineBaseUrl}/v1/account?access_token=${emailEngineAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountRequestBody),
      }
    );

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json();
      console.error('Email engine account creation failed:', errorData);
      return { success: false, error: 'Account creation failed' };
    }

    const accountData = await accountResponse.json();

    if (isMicrosoft) {
      if (accountData.redirect) {
        return { success: true, redirectUrl: accountData.redirect };
      }
      return {
        success: false,
        error: 'Missing redirect URL for Microsoft account',
      };
    }

    const gatewayRequestBody = {
      name: provider === PROVIDER_TYPES.GMAIL ? 'Gmail' : 'Other',
      gateway: credential.emailId,
      user: credential.emailId,
      pass: rawPassword,
      host: credential.providerSMTPHost || 'smtp.gmail.com',
      port: credential.providerSMTPPort || 587,
    };

    const gatewayResponse = await fetch(
      `${emailEngineBaseUrl}/v1/gateway?access_token=${emailEngineAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gatewayRequestBody),
      }
    );

    if (!gatewayResponse.ok) {
      const errorData = await gatewayResponse.json();
      console.error('Email engine gateway creation failed:', errorData);
      return { success: false, error: 'Gateway creation failed' };
    }

    const gatewayData = await gatewayResponse.json();

    if (accountData.account && gatewayData.gateway) {
      return { success: true };
    }

    return { success: false, error: 'Incomplete email engine configuration' };
  } catch (error) {
    console.error('Error connecting to email engine:', error);
    return { success: false, error: String(error) };
  }
}

// ✅ App Router handler function
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, provider } = body;

    if (!credential || !credential.emailId || !credential.password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await createEmailEngineIntegrations(
      credential,
      credential.password,
      provider
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
