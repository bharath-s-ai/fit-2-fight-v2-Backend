// SMS Service - Integration with SMS provider
// Replace with your actual SMS provider (Twilio, MSG91, AWS SNS, etc.)

exports.sendSMS = async (phone, message) => {
  try {
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID;
    
    // For development/testing - simulate success
    if (process.env.NODE_ENV === 'development' || !apiKey) {
      console.log(`\n📱 SMS SIMULATION:`);
      console.log(`To: ${phone}`);
      console.log(`Message: ${message}`);
      console.log(`---\n`);
      
      return {
        success: true,
        messageId: `SMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'sent'
      };
    }
    
    // Example for actual SMS provider (uncomment and modify based on your provider)
    /*
    const response = await fetch('https://api.sms-provider.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        to: phone,
        from: senderId,
        message: message
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'SMS sending failed');
    }
    
    return {
      success: true,
      messageId: data.messageId || data.id,
      status: data.status || 'sent',
      rawResponse: data
    };
    */
    
    // Default return for production without provider setup
    return {
      success: true,
      messageId: `SMS_${Date.now()}`,
      status: 'sent'
    };
    
  } catch (error) {
    console.error('SMS Error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

// Send bulk SMS with rate limiting
exports.sendBulkSMS = async (messages) => {
  const results = [];
  
  for (const msg of messages) {
    try {
      const result = await this.sendSMS(msg.phone, msg.message);
      results.push({ 
        phone: msg.phone, 
        success: true, 
        messageId: result.messageId 
      });
      
      // Add delay to avoid rate limiting (adjust based on provider limits)
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.push({ 
        phone: msg.phone, 
        success: false, 
        error: error.message 
      });
    }
  }
  
  return results;
};

// Validate phone number format (basic validation)
exports.validatePhone = (phone) => {
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's a valid number (10 digits for India, adjust as needed)
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  
  return phoneRegex.test(cleaned);
};
