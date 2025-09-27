# 📧 Email Setup Guide

Your contact form is now ready to send real emails! Here are the setup options:

## Option 1: EmailJS (Recommended - Easiest)

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email

### Step 2: Set Up Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note down your **Service ID**

### Step 3: Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template:

```
Subject: New Contact Form Message: {{subject}}

From: {{from_name}} ({{from_email}})

Message:
{{message}}

---
This message was sent from your portfolio contact form.
```

4. Note down your **Template ID**

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key**

### Step 5: Set Environment Variables
Create a `.env` file in your project root:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Step 6: Update Email Address
In `src/lib/emailService.ts`, replace `'your-email@example.com'` with your actual email address.

---

## Option 2: Formspree (Alternative)

### Step 1: Create Formspree Account
1. Go to [https://formspree.io/](https://formspree.io/)
2. Sign up for a free account

### Step 2: Create New Form
1. Click "New Form"
2. Give it a name (e.g., "Portfolio Contact")
3. Copy the form endpoint URL

### Step 3: Set Environment Variable
Add to your `.env` file:

```env
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id_here
```

---

## Option 3: Netlify Forms (If deploying to Netlify)

### Step 1: Add Netlify Attribute
Add `data-netlify="true"` to your form in `src/components/sections/Contact.tsx`:

```tsx
<form onSubmit={onSubmit} className="space-y-6" data-netlify="true">
```

### Step 2: Deploy to Netlify
1. Deploy your site to Netlify
2. Netlify will automatically detect and set up the form
3. Check the "Forms" section in your Netlify dashboard

---

## Testing

1. Start your development server: `npm run dev`
2. Go to the contact form
3. Fill out and submit a test message
4. Check your email inbox

## Troubleshooting

- **No email received**: Check your spam folder
- **Error messages**: Check the browser console for details
- **Environment variables not working**: Make sure your `.env` file is in the project root and restart your dev server

## Current Fallback

If no email service is configured, the form will open your default email client with a pre-filled message (mailto fallback).
