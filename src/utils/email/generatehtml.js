export const generateEmailTemplate = ({ code, name }) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification</title>
      <style>
        body {
          background-color: #f4f4f7;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 500px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: #4f46e5;
          color: #ffffff;
          text-align: center;
          padding: 20px;
        }
        .content {
          padding: 30px;
          color: #333333;
          text-align: center;
        }
        .otp {
          display: inline-block;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 22px;
          letter-spacing: 4px;
          padding: 12px 24px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 15px;
          font-size: 12px;
          color: #6b7280;
          background: #f9fafb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Verify Your Email</h2>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for signing up! Please use the OTP code below to verify your email address:</p>
          <div class="otp">${code}</div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Social Media App. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
};
