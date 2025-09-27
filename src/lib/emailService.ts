import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export interface EmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (data: EmailData): Promise<boolean> => {
  try {
    // Check if EmailJS is configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS not configured. Using fallback email service.');
      return await sendFallbackEmail(data);
    }

    // Send email using EmailJS
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        from_name: data.name,
        from_email: data.email,
        subject: data.subject,
        message: data.message,
        to_email: 'antoniamugisa@gmail.com', 
      },
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('EmailJS error:', error);
    // Fallback to alternative method
    return await sendFallbackEmail(data);
  }
};

// Fallback email service using mailto link
const sendFallbackEmail = async (data: EmailData): Promise<boolean> => {
  try {
    const subject = encodeURIComponent(data.subject);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
    );
    
    const mailtoLink = `mailto:your-email@example.com?subject=${subject}&body=${body}`;
    
    // Open mailto link
    window.open(mailtoLink, '_blank');
    
    return true;
  } catch (error) {
    console.error('Fallback email error:', error);
    return false;
  }
};

// Alternative: Formspree integration
export const sendEmailViaFormspree = async (data: EmailData): Promise<boolean> => {
  try {
    const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT;
    
    if (!FORMSPREE_ENDPOINT) {
      console.warn('Formspree not configured');
      return false;
    }

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error('Formspree error:', error);
    return false;
  }
};
