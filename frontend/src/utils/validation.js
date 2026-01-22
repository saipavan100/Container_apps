export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const validateAadhaar = (aadhaar) => {
  const re = /^\d{12}$/;
  return re.test(aadhaar);
};

export const validatePAN = (pan) => {
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan);
};

export const validateFile = (file, allowedTypes, maxSize = 5) => {
  if (!file) return { valid: false, error: 'No file selected' };

  const fileType = file.type.toLowerCase();
  const fileSize = file.size / (1024 * 1024); // Convert to MB

  const typeValid = allowedTypes.some(type => fileType.includes(type));
  
  if (!typeValid) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }

  if (fileSize > maxSize) {
    return { 
      valid: false, 
      error: `File size exceeds ${maxSize}MB limit` 
    };
  }

  return { valid: true };
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
