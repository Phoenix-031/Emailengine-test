// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client'

// import React, { useState } from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Alert,
//   CircularProgress,
//   Divider,
//   Grid,
//   Paper,
//   Chip,
// } from '@mui/material';
// import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
// import Papa from 'papaparse';

// // Types
// interface EmailCredential {
//   emailId: string;
//   password: string;
//   provider: string;
// }

// interface EmailData {
//   id: string;
//   email: string;
//   name?: string;
//   [key: string]: any;
// }

// interface EmailContent {
//   subject: string;
//   body: string;
// }

// const PROVIDER_TYPES = {
//   GMAIL: 'gmail',
//   MICROSOFT: 'microsoft',
// };

// const EmailManagementPage: React.FC = () => {
//   // Email Account Setup State
//   const [credential, setCredential] = useState<EmailCredential>({
//     emailId: '',
//     password: '',
//     provider: PROVIDER_TYPES.GMAIL,
//   });
//   const [accountLoading, setAccountLoading] = useState(false);
//   const [accountAlert, setAccountAlert] = useState<{
//     type: 'success' | 'error';
//     message: string;
//   } | null>(null);

//   // Bulk Email State
//   const [csvData, setCsvData] = useState<EmailData[]>([]);
//   const [emailContent, setEmailContent] = useState<EmailContent>({
//     subject: '',
//     body: '',
//   });
//   const [sendLoading, setSendLoading] = useState(false);
//   const [sendAlert, setSendAlert] = useState<{
//     type: 'success' | 'error';
//     message: string;
//   } | null>(null);
  

//   // Handle credential input changes
//   const handleCredentialChange = (field: keyof EmailCredential, value: string) => {
//     setCredential(prev => ({ ...prev, [field]: value }));
//   };

//   // Handle email content changes
//   const handleEmailContentChange = (field: keyof EmailContent, value: string) => {
//     setEmailContent(prev => ({ ...prev, [field]: value }));
//   };

//   // Create email account
//   const handleCreateAccount = async () => {
//     if (!credential.emailId || !credential.password) {
//       setAccountAlert({
//         type: 'error',
//         message: 'Please fill in all required fields',
//       });
//       return;
//     }

//     setAccountLoading(true);
//     setAccountAlert(null);

//     try {
//       const response = await fetch('/api/emailengine/create-account', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           credential,
//           provider: credential.provider,
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         // ✅ Store sender email in localStorage
//         const existing = JSON.parse(localStorage.getItem('senderEmails') || '[]');
//         if (!existing.includes(credential.emailId)) {
//           existing.push(credential.emailId);
//           localStorage.setItem('senderEmails', JSON.stringify(existing));
//         }

//         if (result.redirectUrl) {
//           window.open(result.redirectUrl, '_blank');
//           setAccountAlert({
//             type: 'success',
//             message: 'Please complete the OAuth authorization in the new tab',
//           });
//         } else {
//           setAccountAlert({
//             type: 'success',
//             message: 'Email account created successfully!',
//           });
//         }

//         setCredential({
//           emailId: '',
//           password: '',
//           provider: PROVIDER_TYPES.GMAIL,
//         });
//       } else {
//         setAccountAlert({
//           type: 'error',
//           message: result.error || 'Failed to create email account',
//         });
//       }
//     } catch (error) {
//       console.log("THE ERROR", error)
//       setAccountAlert({
//         type: 'error',
//         message: 'An error occurred while creating the account',
//       });
//     } finally {
//       setAccountLoading(false);
//     }
//   };

//   // Handle CSV file upload
//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     Papa.parse(file, {
//       complete: (results) => {
//         const data = results.data as string[][];
//         if (data.length > 0) {
//           const headers = data[0];
//           const emailData: EmailData[] = data.slice(1).map((row, index) => {
//             const obj: EmailData = {
//               id: `email-${index}`, // Required for DataGrid
//               email: '', // Initialize email with an empty string
//             };
//             headers.forEach((header, headerIndex) => {
//               const key = header.toLowerCase().trim();
//               obj[key] = row[headerIndex] || '';
//             });
//             return obj;
//           }).filter(item => item.email && item.email.includes('@'));
          
//           setCsvData(emailData);
//           setSendAlert({
//             type: 'success',
//             message: `Successfully loaded ${emailData.length} email addresses`,
//           });
//         }
//       },
//       header: false,
//       skipEmptyLines: true,
//     });
//   };

//   // Send bulk emails
//   const handleSendEmails = async () => {
//     if (csvData.length === 0) {
//       setSendAlert({
//         type: 'error',
//         message: 'Please upload a CSV file with email addresses',
//       });
//       return;
//     }

//     if (!emailContent.subject || !emailContent.body) {
//       setSendAlert({
//         type: 'error',
//         message: 'Please fill in both subject and body',
//       });
//       return;
//     }

//     // 🔄 Get senderEmails from localStorage
//     const senderEmails = JSON.parse(localStorage.getItem('senderEmails') || '[]');

//     if (!Array.isArray(senderEmails) || senderEmails.length === 0) {
//       setSendAlert({
//         type: 'error',
//         message: 'No sender email found. Please create an email account first.',
//       });
//       return;
//     }

//     setSendLoading(true);
//     setSendAlert(null);

//     try {
//       const response = await fetch('/api/emailengine/send-bulk', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           senderEmails, // ✅ include senderEmails in the request
//           recipients: csvData,
//           subject: emailContent.subject,
//           body: emailContent.body,
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSendAlert({
//           type: 'success',
//           message: `Successfully sent emails to ${csvData.length} recipients`,
//         });
//         setEmailContent({ subject: '', body: '' });
//         setCsvData([]);
//       } else {
//         setSendAlert({
//           type: 'error',
//           message: result.error || 'Failed to send emails',
//         });
//       }
//     } catch (error) {
//       console.log("error sending", error)
//       setSendAlert({
//         type: 'error',
//         message: 'An error occurred while sending emails',
//       });
//     } finally {
//       setSendLoading(false);
//     }
//   };


//   // DataGrid columns configuration
//   const columns: GridColDef[] = [
//     {
//       field: 'email',
//       headerName: 'Email Address',
//       flex: 1,
//       minWidth: 250,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <Chip
//             label="@"
//             size="small"
//             variant="outlined"
//             color="primary"
//             sx={{ fontSize: '0.7rem', height: '20px' }}
//           />
//           {params.value}
//         </Box>
//       ),
//     },
//     {
//       field: 'name',
//       headerName: 'Name',
//       flex: 0.8,
//       minWidth: 150,
//       renderCell: (params) => params.value || '—',
//     },
//   ];

//   // Prepare rows for DataGrid
//   const rows: GridRowsProp = csvData.map((item, index) => ({
//     id: item.id || `row-${index}`,
//     email: item.email || '',
//     name: item.name || '',
//   }));

//   return (
//     <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
//       <Typography variant="h4" component="h1" gutterBottom>
//         Email Management System
//       </Typography>

//       {/* Email Account Setup Section */}
//       <Card sx={{ mb: 4 }}>
//         <CardContent>
//           <Typography variant="h5" component="h2" gutterBottom>
//             Setup Email Account
//           </Typography>
          
//           {accountAlert && (
//             <Alert severity={accountAlert.type} sx={{ mb: 2 }}>
//               {accountAlert.message}
//             </Alert>
//           )}

//           <Grid container spacing={2}>
//             <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
//               <TextField
//                 fullWidth
//                 label="Email Address"
//                 type="email"
//                 value={credential.emailId}
//                 onChange={(e) => handleCredentialChange('emailId', e.target.value)}
//                 required
//               />
//             </Grid>
//             <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
//               <TextField
//                 fullWidth
//                 label="App Password"
//                 type="password"
//                 value={credential.password}
//                 onChange={(e) => handleCredentialChange('password', e.target.value)}
//                 required
//                 helperText="Use app-specific password for Gmail"
//               />
//             </Grid>
//             <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
//               <FormControl fullWidth>
//                 <InputLabel>Provider</InputLabel>
//                 <Select
//                   value={credential.provider}
//                   label="Provider"
//                   onChange={(e) => handleCredentialChange('provider', e.target.value)}
//                 >
//                   <MenuItem value={PROVIDER_TYPES.GMAIL}>Gmail</MenuItem>
//                   <MenuItem value={PROVIDER_TYPES.MICROSOFT}>Microsoft</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>

//           <Button
//             variant="contained"
//             onClick={handleCreateAccount}
//             disabled={accountLoading}
//             sx={{ mt: 2 }}
//             startIcon={accountLoading ? <CircularProgress size={20} /> : null}
//           >
//             {accountLoading ? 'Creating Account...' : 'Create Email Account'}
//           </Button>
//         </CardContent>
//       </Card>

//       <Divider sx={{ my: 4 }} />

//       {/* Bulk Email Section */}
//       <Card>
//         <CardContent>
//           <Typography variant="h5" component="h2" gutterBottom>
//             Send Bulk Emails
//           </Typography>

//           {sendAlert && (
//             <Alert severity={sendAlert.type} sx={{ mb: 2 }}>
//               {sendAlert.message}
//             </Alert>
//           )}

//           {/* File Upload */}
//           <Paper sx={{ p: 2, mb: 3 }}>
//             <Typography variant="h6" gutterBottom>
//               Upload Recipients CSV
//             </Typography>
//             <input
//               accept=".csv"
//               type="file"
//               onChange={handleFileUpload}
//               style={{ marginBottom: '16px' }}
//             />
//             <Typography variant="body2" color="textSecondary">
//               CSV should contain columns: email, name (optional)
//             </Typography>
//           </Paper>

//           {/* Email Content */}
//           <Grid container spacing={2} sx={{ mb: 3 }}>
//             <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
//               <TextField
//                 fullWidth
//                 label="Email Subject"
//                 value={emailContent.subject}
//                 onChange={(e) => handleEmailContentChange('subject', e.target.value)}
//                 required
//               />
//             </Grid>
//             <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
//               <TextField
//                 fullWidth
//                 label="Email Body"
//                 multiline
//                 rows={6}
//                 value={emailContent.body}
//                 onChange={(e) => handleEmailContentChange('body', e.target.value)}
//                 required
//               />
//             </Grid>
//           </Grid>

//           {/* Recipients DataGrid */}
//           {csvData.length > 0 && (
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 Recipients ({csvData.length})
//               </Typography>
//               <Box sx={{ height: 400, width: '100%' }}>
//               <DataGrid
//                 rows={rows}
//                 columns={columns}
//                 initialState={{
//                   pagination: {
//                     paginationModel: { pageSize: 10, page: 0 },
//                   },
//                 }}
//                 checkboxSelection={false}
//                 // disableSelectionOnClick
//                 sx={{
//                   '& .MuiDataGrid-cell': {
//                     fontSize: '0.875rem',
//                   },
//                   '& .MuiDataGrid-columnHeaders': {
//                     backgroundColor: '#f5f5f5',
//                     fontSize: '0.875rem',
//                     fontWeight: 600,
//                   },
//                 }}
//               />
//               </Box>
//             </Box>
//           )}

//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleSendEmails}
//             disabled={sendLoading || csvData.length === 0}
//             startIcon={sendLoading ? <CircularProgress size={20} /> : null}
//             size="large"
//           >
//             {sendLoading ? 'Sending Emails...' : `Send Emails (${csvData.length})`}
//           </Button>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default EmailManagementPage;
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// import React, { useState } from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Alert,
//   CircularProgress,
//   Divider,
//   Grid,
//   Paper,
//   Chip,
// } from '@mui/material';
// import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
// import Papa from 'papaparse';
// import AddIcon from '@mui/icons-material/Add';

// interface EmailCredential {
//   emailId: string;
//   password: string;
//   provider: string;
// }

// interface EmailData {
//   id: string;
//   email: string;
//   name?: string;
//   [key: string]: any;
// }

// interface EmailStep {
//   subject: string;
//   body: string;
//   hours: string;
//   minutes: string;
// }

// const PROVIDER_TYPES = {
//   GMAIL: 'gmail',
//   MICROSOFT: 'microsoft',
// };

// const EmailManagementPage: React.FC = () => {
//   const [credential, setCredential] = useState<EmailCredential>({
//     emailId: '',
//     password: '',
//     provider: PROVIDER_TYPES.GMAIL,
//   });
//   const [accountLoading, setAccountLoading] = useState(false);
//   const [accountAlert, setAccountAlert] = useState<{
//     type: 'success' | 'error';
//     message: string;
//   } | null>(null);

//   const [csvData, setCsvData] = useState<EmailData[]>([]);
//   const [emailSteps, setEmailSteps] = useState<EmailStep[]>([{
//     subject: '',
//     body: '',
//     hours: '',
//     minutes: '',
//   }]);
//   const [sendLoading, setSendLoading] = useState(false);
//   const [sendAlert, setSendAlert] = useState<{
//     type: 'success' | 'error';
//     message: string;
//   } | null>(null);

//   const handleCredentialChange = (field: keyof EmailCredential, value: string) => {
//     setCredential(prev => ({ ...prev, [field]: value }));
//   };

//   const handleStepChange = (index: number, field: keyof EmailStep, value: string) => {
//     setEmailSteps(prev => {
//       const updated = [...prev];
//       updated[index][field] = value;
//       return updated;
//     });
//   };

//   const handleCreateAccount = async () => {
//     if (!credential.emailId || !credential.password) {
//       setAccountAlert({ type: 'error', message: 'Please fill in all required fields' });
//       return;
//     }

//     setAccountLoading(true);
//     setAccountAlert(null);

//     try {
//       const response = await fetch('/api/emailengine/create-account', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ credential, provider: credential.provider }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         const existing = JSON.parse(localStorage.getItem('senderEmails') || '[]');
//         if (!existing.includes(credential.emailId)) {
//           existing.push(credential.emailId);
//           localStorage.setItem('senderEmails', JSON.stringify(existing));
//         }

//         if (result.redirectUrl) {
//           window.open(result.redirectUrl, '_blank');
//           setAccountAlert({ type: 'success', message: 'Please complete OAuth in new tab' });
//         } else {
//           setAccountAlert({ type: 'success', message: 'Email account created successfully!' });
//         }

//         setCredential({ emailId: '', password: '', provider: PROVIDER_TYPES.GMAIL });
//       } else {
//         setAccountAlert({ type: 'error', message: result.error || 'Failed to create account' });
//       }
//     } catch (error) {
//       console.log("Error", error)
//       setAccountAlert({ type: 'error', message: 'An error occurred while creating account' });
//     } finally {
//         const existing = JSON.parse(localStorage.getItem('senderEmails') || '[]');
//         if (!existing.includes(credential.emailId)) {
//           existing.push(credential.emailId);
//           localStorage.setItem('senderEmails', JSON.stringify(existing));
//         }
//       setAccountLoading(false);
//     }
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     Papa.parse(file, {
//       complete: (results) => {
//         const data = results.data as string[][];
//         if (data.length > 0) {
//           const headers = data[0];
//           const emailData: EmailData[] = data.slice(1).map((row, index) => {
//             const obj: EmailData = { id: `email-${index}`, email: '' };
//             headers.forEach((header, i) => {
//               const key = header.toLowerCase().trim();
//               obj[key] = row[i] || '';
//             });
//             return obj;
//           }).filter(item => item.email && item.email.includes('@'));

//           setCsvData(emailData);
//           setSendAlert({ type: 'success', message: `Loaded ${emailData.length} email addresses` });
//         }
//       },
//       header: false,
//       skipEmptyLines: true,
//     });
//   };

//   const handleSendEmails = async () => {
//     if (csvData.length === 0) {
//       setSendAlert({ type: 'error', message: 'Upload a CSV with email addresses' });
//       return;
//     }

//     if (emailSteps.some(step => !step.subject || !step.body)) {
//       setSendAlert({ type: 'error', message: 'Fill all subject and body fields in steps' });
//       return;
//     }

//     const senderEmails = JSON.parse(localStorage.getItem('senderEmails') || '[]');
//     if (!Array.isArray(senderEmails) || senderEmails.length === 0) {
//       setSendAlert({ type: 'error', message: 'No sender email found. Create one first.' });
//       return;
//     }

//     setSendLoading(true);
//     setSendAlert(null);

//     try {
//       const response = await fetch('/api/emailengine/send-bulk', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           senderEmails,
//           recipients: csvData,
//           steps: emailSteps.map(step => ({
//             subject: step.subject,
//             body: step.body,
//             sendAfter: {
//               hours: Number(step.hours) || 0,
//               minutes: Number(step.minutes) || 0,
//             },
//           })),
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSendAlert({ type: 'success', message: `Sent emails to ${csvData.length} recipients` });
//         setEmailSteps([{ subject: '', body: '', hours: '', minutes: '' }]);
//         setCsvData([]);
//       } else {
//         setSendAlert({ type: 'error', message: result.error || 'Failed to send emails' });
//       }
//     } catch (error) {
//       console.log("Error", error)
//       setSendAlert({ type: 'error', message: 'Error occurred while sending emails' });
//     } finally {
//       setSendLoading(false);
//     }
//   };

//   const columns: GridColDef[] = [
//     {
//       field: 'email',
//       headerName: 'Email Address',
//       flex: 1,
//       minWidth: 250,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <Chip label="@" size="small" variant="outlined" color="primary" />
//           {params.value}
//         </Box>
//       ),
//     },
//     {
//       field: 'name',
//       headerName: 'Name',
//       flex: 0.8,
//       minWidth: 150,
//       renderCell: (params) => params.value || '—',
//     },
//   ];

//   const rows: GridRowsProp = csvData.map((item, i) => ({
//     id: item.id || `row-${i}`,
//     email: item.email || '',
//     name: item.name || '',
//   }));

//   return (
//     <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
//       <Typography variant="h4" gutterBottom>Email Management System</Typography>

//       <Card sx={{ mb: 4 }}>
//         <CardContent>
//           <Typography variant="h5" gutterBottom>Setup Email Account</Typography>
//           {accountAlert && <Alert severity={accountAlert.type} sx={{ mb: 2 }}>{accountAlert.message}</Alert>}

//           <Grid container spacing={2}>
//             <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
//               <TextField fullWidth label="Email Address" type="email" value={credential.emailId} onChange={(e) => handleCredentialChange('emailId', e.target.value)} required />
//             </Grid>
//             <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
//               <TextField fullWidth label="App Password" type="password" value={credential.password} onChange={(e) => handleCredentialChange('password', e.target.value)} required helperText="Use app-specific password for Gmail" />
//             </Grid>
//             <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
//               <FormControl fullWidth>
//                 <InputLabel>Provider</InputLabel>
//                 <Select value={credential.provider} label="Provider" onChange={(e) => handleCredentialChange('provider', e.target.value)}>
//                   <MenuItem value={PROVIDER_TYPES.GMAIL}>Gmail</MenuItem>
//                   <MenuItem value={PROVIDER_TYPES.MICROSOFT}>Microsoft</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>

//           <Button variant="contained" onClick={handleCreateAccount} disabled={accountLoading} sx={{ mt: 2 }} startIcon={accountLoading ? <CircularProgress size={20} /> : null}>
//             {accountLoading ? 'Creating Account...' : 'Create Email Account'}
//           </Button>
//         </CardContent>
//       </Card>

//       <Divider sx={{ my: 4 }} />

//       <Card>
//         <CardContent>
//           <Typography variant="h5" gutterBottom>Send Bulk Emails</Typography>
//           {sendAlert && <Alert severity={sendAlert.type} sx={{ mb: 2 }}>{sendAlert.message}</Alert>}

//           <Paper sx={{ p: 2, mb: 3 }}>
//             <Typography variant="h6" gutterBottom>Upload Recipients CSV</Typography>
//             <input accept=".csv" type="file" onChange={handleFileUpload} style={{ marginBottom: '16px' }} />
//             <Typography variant="body2" color="textSecondary">CSV should contain columns: email, name (optional)</Typography>
//           </Paper>

//           {emailSteps.map((step, index) => (
//             <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
//               <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
//                 <TextField fullWidth label={`Subject (Step ${index + 1})`} value={step.subject} onChange={(e) => handleStepChange(index, 'subject', e.target.value)} required />
//               </Grid>
//               <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
//                 <TextField fullWidth multiline rows={4} label={`Body (Step ${index + 1})`} value={step.body} onChange={(e) => handleStepChange(index, 'body', e.target.value)} required />
//               </Grid>
//               <Grid sx={{ gridColumn: { xs: 'span 6', 'sm': 'span 3' } }}>
//                 <TextField fullWidth type="number" label="Hours Delay" value={step.hours} onChange={(e) => handleStepChange(index, 'hours', e.target.value)} />
//               </Grid>
//               <Grid sx={{ gridColumn: { xs: 'span 6', 'sm': 'span 3' } }}>
//                 <TextField fullWidth type="number" label="Minutes Delay" value={step.minutes} onChange={(e) => handleStepChange(index, 'minutes', e.target.value)} />
//               </Grid>
//             </Grid>
//           ))}

//           <Button variant="outlined" onClick={() => setEmailSteps(prev => [...prev, { subject: '', body: '', hours: '', minutes: '' }])} startIcon={<AddIcon />} sx={{ mb: 3 }}>Add Email Step</Button>

//           {csvData.length > 0 && (
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="h6" gutterBottom>Recipients ({csvData.length})</Typography>
//               <Box sx={{ height: 400, width: '100%' }}>
//                 <DataGrid rows={rows} columns={columns} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} checkboxSelection={false} sx={{ '& .MuiDataGrid-cell': { fontSize: '0.875rem' }, '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5', fontWeight: 600 } }} />
//               </Box>
//             </Box>
//           )}

//           <Button variant="contained" color="primary" onClick={handleSendEmails} disabled={sendLoading || csvData.length === 0} startIcon={sendLoading ? <CircularProgress size={20} /> : null} size="large">
//             {sendLoading ? 'Sending Emails...' : `Send Emails (${csvData.length})`}
//           </Button>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default EmailManagementPage;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Chip,
  Drawer,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import Papa from 'papaparse';
import AddIcon from '@mui/icons-material/Add';

interface EmailCredential {
  emailId: string;
  password: string;
  provider: string;
}

interface EmailData {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
}

interface EmailStep {
  subject: string;
  body: string;
  hours: string;
  minutes: string;
}

const PROVIDER_TYPES = {
  GMAIL: 'gmail',
  MICROSOFT: 'microsoft',
};

const EmailManagementPage: React.FC = () => {
  const [credential, setCredential] = useState<EmailCredential>({
    emailId: '',
    password: '',
    provider: PROVIDER_TYPES.GMAIL,
  });
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountAlert, setAccountAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [csvData, setCsvData] = useState<EmailData[]>([]);
  const [emailSteps, setEmailSteps] = useState<EmailStep[]>([{
    subject: '',
    body: '',
    hours: '',
    minutes: '',
  }]);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendAlert, setSendAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [logs, setLogs] = useState<string[]>([]);
  const [isLogDrawerOpen, setLogDrawerOpen] = useState(false);

  useEffect(() => {
  const eventSource = new EventSource('/api/emailengine/log-stream');

  eventSource.onmessage = (event) => {
    const log = JSON.parse(event.data);
    setLogs(prev => [...prev, `${new Date(log.time).toLocaleTimeString()}: ${log.msg}`]);
  };

  eventSource.onerror = (err) => {
    console.error('SSE connection error:', err);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}, []);


  const logMessage = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const handleCredentialChange = (field: keyof EmailCredential, value: string) => {
    setCredential(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index: number, field: keyof EmailStep, value: string) => {
    setEmailSteps(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleCreateAccount = async () => {
    if (!credential.emailId || !credential.password) {
      setAccountAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setAccountLoading(true);
    setAccountAlert(null);

    try {
      const response = await fetch('/api/emailengine/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, provider: credential.provider }),
      });

      const result = await response.json();

      if (result.success) {
        const existing = JSON.parse(localStorage.getItem('senderEmails') || '[]');
        if (!existing.includes(credential.emailId)) {
          existing.push(credential.emailId);
          localStorage.setItem('senderEmails', JSON.stringify(existing));
        }

        if (result.redirectUrl) {
          window.open(result.redirectUrl, '_blank');
          setAccountAlert({ type: 'success', message: 'Please complete OAuth in new tab' });
        } else {
          setAccountAlert({ type: 'success', message: 'Email account created successfully!' });
        }

        setCredential({ emailId: '', password: '', provider: PROVIDER_TYPES.GMAIL });
      } else {
        setAccountAlert({ type: 'error', message: result.error || 'Failed to create account' });
      }
    } catch (error) {
      console.log("Error", error)
      setAccountAlert({ type: 'error', message: 'An error occurred while creating account' });
    } finally {
      const existing = JSON.parse(localStorage.getItem('senderEmails') || '[]');
      if (!existing.includes(credential.emailId)) {
        existing.push(credential.emailId);
        localStorage.setItem('senderEmails', JSON.stringify(existing));
      }
      setAccountLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length > 0) {
          const headers = data[0];
          const emailData: EmailData[] = data.slice(1).map((row, index) => {
            const obj: EmailData = { id: `email-${index}`, email: '' };
            headers.forEach((header, i) => {
              const key = header.toLowerCase().trim();
              obj[key] = row[i] || '';
            });
            return obj;
          }).filter(item => item.email && item.email.includes('@'));

          setCsvData(emailData);
          setSendAlert({ type: 'success', message: `Loaded ${emailData.length} email addresses` });
          logMessage(`CSV uploaded with ${emailData.length} valid email(s)`);
        }
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  const handleSendEmails = async () => {
    if (csvData.length === 0) {
      setSendAlert({ type: 'error', message: 'Upload a CSV with email addresses' });
      return;
    }

    if (emailSteps.some(step => !step.subject || !step.body)) {
      setSendAlert({ type: 'error', message: 'Fill all subject and body fields in steps' });
      return;
    }

    const senderEmails = JSON.parse(localStorage.getItem('senderEmails') || '[]');
    if (!Array.isArray(senderEmails) || senderEmails.length === 0) {
      setSendAlert({ type: 'error', message: 'No sender email found. Create one first.' });
      return;
    }

    setSendLoading(true);
    setSendAlert(null);
    logMessage('Initiating email send process...');
    logMessage(`Sending to ${csvData.length} recipient(s) with ${emailSteps.length} step(s)...`);

    try {
      const response = await fetch('/api/emailengine/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmails,
          recipients: csvData,
          steps: emailSteps.map(step => ({
            subject: step.subject,
            body: step.body,
            sendAfter: {
              hours: Number(step.hours) || 0,
              minutes: Number(step.minutes) || 0,
            },
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSendAlert({ type: 'success', message: `Sent emails to ${csvData.length} recipients` });
        setEmailSteps([{ subject: '', body: '', hours: '', minutes: '' }]);
        setCsvData([]);
        logMessage('✅ Emails sent successfully!');
      } else {
        setSendAlert({ type: 'error', message: result.error || 'Failed to send emails' });
        logMessage(`❌ Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log("Error", error)
      setSendAlert({ type: 'error', message: 'Error occurred while sending emails' });
      logMessage(`❌ Exception: ${(error as Error).message}`);
    } finally {
      setSendLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="@" size="small" variant="outlined" color="primary" />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => params.value || '—',
    },
  ];

  const rows: GridRowsProp = csvData.map((item, i) => ({
    id: item.id || `row-${i}`,
    email: item.email || '',
    name: item.name || '',
  }));

  return (
    <>
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}>
        <Button variant="outlined" onClick={() => setLogDrawerOpen(true)}>Show Logs</Button>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom>Email Management System</Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Setup Email Account</Typography>
            {accountAlert && <Alert severity={accountAlert.type} sx={{ mb: 2 }}>{accountAlert.message}</Alert>}

            <Grid container spacing={2}>
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <TextField fullWidth label="Email Address" type="email" value={credential.emailId} onChange={(e) => handleCredentialChange('emailId', e.target.value)} required />
              </Grid>
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <TextField fullWidth label="App Password" type="password" value={credential.password} onChange={(e) => handleCredentialChange('password', e.target.value)} required helperText="Use app-specific password for Gmail" />
              </Grid>
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <FormControl fullWidth>
                  <InputLabel>Provider</InputLabel>
                  <Select value={credential.provider} label="Provider" onChange={(e) => handleCredentialChange('provider', e.target.value)}>
                    <MenuItem value={PROVIDER_TYPES.GMAIL}>Gmail</MenuItem>
                    <MenuItem value={PROVIDER_TYPES.MICROSOFT}>Microsoft</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button variant="contained" onClick={handleCreateAccount} disabled={accountLoading} sx={{ mt: 2 }} startIcon={accountLoading ? <CircularProgress size={20} /> : null}>
              {accountLoading ? 'Creating Account...' : 'Create Email Account'}
            </Button>
          </CardContent>
        </Card>

        <Divider sx={{ my: 4 }} />

        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Send Bulk Emails</Typography>
            {sendAlert && <Alert severity={sendAlert.type} sx={{ mb: 2 }}>{sendAlert.message}</Alert>}

            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Upload Recipients CSV</Typography>
              <input accept=".csv" type="file" onChange={handleFileUpload} style={{ marginBottom: '16px' }} />
              <Typography variant="body2" color="textSecondary">CSV should contain columns: email, name (optional)</Typography>
            </Paper>

            {emailSteps.map((step, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
                  <TextField fullWidth label={`Subject (Step ${index + 1})`} value={step.subject} onChange={(e) => handleStepChange(index, 'subject', e.target.value)} required />
                </Grid>
                <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
                  <TextField fullWidth multiline rows={4} label={`Body (Step ${index + 1})`} value={step.body} onChange={(e) => handleStepChange(index, 'body', e.target.value)} required />
                </Grid>
                <Grid sx={{ gridColumn: { xs: 'span 6', sm: 'span 3' } }}>
                  <TextField fullWidth type="number" label="Hours Delay" value={step.hours} onChange={(e) => handleStepChange(index, 'hours', e.target.value)} />
                </Grid>
                <Grid sx={{ gridColumn: { xs: 'span 6', sm: 'span 3' } }}>
                  <TextField fullWidth type="number" label="Minutes Delay" value={step.minutes} onChange={(e) => handleStepChange(index, 'minutes', e.target.value)} />
                </Grid>
              </Grid>
            ))}

            <Button variant="outlined" onClick={() => setEmailSteps(prev => [...prev, { subject: '', body: '', hours: '', minutes: '' }])} startIcon={<AddIcon />} sx={{ mb: 3 }}>
              Add Email Step
            </Button>

            {csvData.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Recipients ({csvData.length})</Typography>
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                      },
                    }}
                    checkboxSelection={false}
                    sx={{
                      '& .MuiDataGrid-cell': { fontSize: '0.875rem' },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                      },
                    }}
                  />
                </Box>
              </Box>
            )}

            <Button variant="contained" color="primary" onClick={handleSendEmails} disabled={sendLoading || csvData.length === 0} startIcon={sendLoading ? <CircularProgress size={20} /> : null} size="large">
              {sendLoading ? 'Sending Emails...' : `Send Emails (${csvData.length})`}
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Drawer
        anchor="right"
        open={isLogDrawerOpen}
        onClose={() => setLogDrawerOpen(false)}
        PaperProps={{ sx: { width: 400, p: 2 } }}
      >
        <Typography variant="h6" gutterBottom>Logs</Typography>
        <Box sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <Typography variant="body2" color="textSecondary">No logs yet</Typography>
          ) : (
            logs.map((log, i) => (
              <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                {log}
              </Typography>
            ))
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default EmailManagementPage;
