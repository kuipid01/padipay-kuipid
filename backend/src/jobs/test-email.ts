import "dotenv/config";
import { brevo } from "../lib/brevo";

async function runTest() {
  console.log("Testing Brevo email sending...");
  
  const result = await brevo.sendEmail({
    to: [{ email: "kuipid02@gmail.com", name: "Test User" }],
    subject: "Brevo API Test",
    htmlContent: "<h1>Hello!</h1><p>This is an isolated test email to verify the Brevo integration.</p>"
  });

  if (result.success) {
    console.log("Email sent successfully! Message ID:", result.messageId);
  } else {
    console.error("Failed to send email. Error:", result.error);
  }
}

runTest().catch((e) => console.error(e));
