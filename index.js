const express = require("express");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");
const cron = require("node-cron"); // For scheduling tasks

const app = express();

const transporter = nodemailer.createTransport({
  service: "gmail", // or use any other service, or configure SMTP
  auth: {
    user: "mirzad.varupa98@gmail.com",
    pass: "cldb iaej opqv ziso",
  },
});

async function fetchAndExtractDiv() {
  try {
    const apiUrl = "https://www.izbori.ba/?Lang=3&CategoryID=64"; // Replace with actual API URL

    const response = await fetch(apiUrl);
    const html = await response.text();

    const $ = cheerio.load(html);
    const targetDiv = $(".lower-box");
    const lastDiv = targetDiv.first();

    return lastDiv.html();
  } catch (error) {
    console.error("Error fetching or parsing HTML:", error);
    return null;
  }
}

async function sendEmailWithDivContent(divHtml) {
  const mailOptions = {
    from: "mirzad.varupa98@gmail.com",
    to: "varupamirzad@gmail.com",
    subject: "Izbori UPDATE",
    html: `
    <html>
        <head>
          <style>
            .header { 
              background-color: #f2f2f2; 
              padding: 10px; 
              text-align: center; 
              font-size: 24px; 
              font-family: Arial, sans-serif; 
            }
            .content { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
            }
            .footer { 
              background-color: #f2f2f2; 
              text-align: center; 
              padding: 10px; 
              font-size: 12px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Here is the Latest Content from the CIK website</h1>
          </div>
          <div class="content">
            <p>This is the content fetched from the API's div:</p>
            ${divHtml}  <!-- Insert the extracted div HTML here -->
          </div>
          <div class="footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
          </div>
        </body>
      </html>

    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

cron.schedule(
  "0 8,10,12,13,15,17,18,19,20 * * *",
  async () => {
    console.log("Running task to fetch div and send email...");
    const divContent = await fetchAndExtractDiv();

    if (divContent) {
      await sendEmailWithDivContent(divContent);
    } else {
      console.log("No content found or an error occurred.");
    }
  },
  {
    scheduled: true,
    timezone: "Europe/Sarajevo",
  }
);

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
