export const Templates = {
  PRE_DUE_3_DAYS: {
    SMS: (name: string, amount: string, dueDate: string, link: string) => 
      `Hi ${name}, friendly reminder that your Padi loan repayment of ${amount} is due on ${dueDate}. Log in to pay: ${link}`,
    EMAIL_SUBJECT: (amount: string, dueDate: string) => `Friendly Reminder: PadiLoan payment of ${amount} due on ${dueDate}`,
    EMAIL_HTML: (name: string, amount: string, dueDate: string, link: string) => `
      <p>Hi ${name},</p>
      <p>This is a friendly reminder that your loan repayment of <strong>${amount}</strong> is due on <strong>${dueDate}</strong>.</p>
      <p>Please log in to your account to make the payment: <a href="${link}">${link}</a></p>
      <p>Thank you for choosing PadiLoan!</p>
    `
  },
  PRE_DUE_1_DAY: {
    SMS: (name: string, amount: string, dueDate: string, link: string) => 
      `Hi ${name}, your Padi loan repayment of ${amount} is due tomorrow (${dueDate}). Pay now: ${link}`,
    EMAIL_SUBJECT: (amount: string, dueDate: string) => `Action Required: PadiLoan payment of ${amount} due tomorrow!`,
    EMAIL_HTML: (name: string, amount: string, dueDate: string, link: string) => `
      <p>Hi ${name},</p>
      <p>Your loan repayment of <strong>${amount}</strong> is due tomorrow on <strong>${dueDate}</strong>.</p>
      <p>Please log in to your account to make the payment: <a href="${link}">${link}</a></p>
    `
  },
  DUE_TODAY: {
    SMS: (name: string, amount: string, dueDate: string, link: string) => 
      `Hi ${name}, your Padi loan repayment of ${amount} is due TODAY. Pls pay to avoid late fees: ${link}`,
    EMAIL_SUBJECT: (amount: string) => `DUE TODAY: PadiLoan payment of ${amount}`,
    EMAIL_HTML: (name: string, amount: string, dueDate: string, link: string) => `
      <p>Hi ${name},</p>
      <p>Your loan repayment of <strong>${amount}</strong> is due <strong>TODAY</strong>.</p>
      <p>Please log in to your account to make the payment to avoid any late fees: <a href="${link}">${link}</a></p>
    `
  },
  OVERDUE_1_DAY: {
    SMS: (name: string, amount: string, dueDate: string, link: string) => 
      `Hi ${name}, your Padi loan repayment of ${amount} is 1 day OVERDUE. Late fees may apply. Pay now: ${link}`,
    EMAIL_SUBJECT: (amount: string) => `OVERDUE: PadiLoan payment of ${amount} was due yesterday`,
    EMAIL_HTML: (name: string, amount: string, dueDate: string, link: string) => `
      <p>Hi ${name},</p>
      <p>Your loan repayment of <strong>${amount}</strong> is now <strong>1 day OVERDUE</strong>.</p>
      <p>Please make your payment immediately to avoid additional late fees: <a href="${link}">${link}</a></p>
    `
  },
  OVERDUE_3_DAYS: {
    SMS: (name: string, amount: string, dueDate: string, link: string) => 
      `Hi ${name}, your Padi loan repayment of ${amount} is 3 days OVERDUE. Late fees have been applied. Pay now: ${link}`,
    EMAIL_SUBJECT: (amount: string) => `URGENT: PadiLoan payment of ${amount} is 3 days OVERDUE`,
    EMAIL_HTML: (name: string, amount: string, dueDate: string, link: string) => `
      <p>Hi ${name},</p>
      <p>Your loan repayment of <strong>${amount}</strong> is now <strong>3 days OVERDUE</strong>.</p>
      <p>Late fees have been applied. Please make your payment immediately to avoid further actions: <a href="${link}">${link}</a></p>
    `
  },
  OVERDUE_7_DAYS: {
    SMS: (name: string, amount: string, dueDate: string, link: string) => 
      `Hi ${name}, URGENT: your Padi loan repayment of ${amount} is 7 days OVERDUE. Your account may be restricted. Pay immediately: ${link}`,
    EMAIL_SUBJECT: (amount: string) => `CRITICAL: PadiLoan payment of ${amount} is 7 days OVERDUE`,
    EMAIL_HTML: (name: string, amount: string, dueDate: string, link: string) => `
      <p>Hi ${name},</p>
      <p>Your loan repayment of <strong>${amount}</strong> is now <strong>7 days OVERDUE</strong>.</p>
      <p>This is a critical notice. Failure to pay may result in account restriction and reporting to credit bureaus.</p>
      <p>Make your payment immediately: <a href="${link}">${link}</a></p>
    `
  },
  PAYMENT_CONFIRMATION: {
    SMS: (name: string, amount: string, dueDate: string, link: string) => 
      `Hi ${name}, we received your payment of ${amount} for your PadiLoan. Thank you!`,
    EMAIL_SUBJECT: (amount: string) => `Payment Received: ${amount}`,
    EMAIL_HTML: (name: string, amount: string, dueDate: string, link: string) => `
      <p>Hi ${name},</p>
      <p>We are writing to confirm that we have successfully received your payment of <strong>${amount}</strong>.</p>
      <p>Thank you for choosing PadiLoan!</p>
    `
  },
  FUNDING_REQUESTED: {
    SMS: (name: string, amount: string, dueDate: string, link: string) => 
      `Hi Admin, loan application for ${name} (${amount}) was approved and requires funding. Link: ${link}`,
    EMAIL_SUBJECT: (amount: string) => `FUNDING REQUIRED: Application approved for ${amount}`,
    EMAIL_HTML: (name: string, amount: string, dueDate: string, link: string) => `
      <p>Hello Admin,</p>
      <p>A loan application for <strong>${name}</strong> has been approved for the amount of <strong>${amount}</strong>.</p>
      <p>Please review and handle the funding here: <a href="${link}">${link}</a></p>
    `
  },
  FUNDS_DISBURSED: {
    SMS: (name: string, amount: string, dueDate: string, link: string) => 
      `Hi ${name}, your loan of ${amount} has been successfully funded!`,
    EMAIL_SUBJECT: (amount: string) => `Funds Disbursed: Your loan of ${amount} is on the way!`,
    EMAIL_HTML: (name: string, amount: string, dueDate: string, link: string) => `
      <p>Hi ${name},</p>
      <p>Great news! Your loan application for <strong>${amount}</strong> has been successfully funded.</p>
      <p>The funds should reflect in your account shortly. You can view your active loan and repayment schedule here: <a href="${link}">${link}</a></p>
    `
  }
};
