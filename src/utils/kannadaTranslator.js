// Kannada Translation Utility for Admin Panel
// This is a basic translation system that can be expanded

const translations = {
  // Admin Dashboard
  'Dashboard': 'ಡ್ಯಾಶ್ಬೋರ್ಡ್',
  'Products': 'ಉತ್ಪನ್ನಗಳು',
  'Orders': 'ಆದೇಶಗಳು',
  'Customers': 'ಗ್ರಾಹಕರು',
  'Suppliers': 'ಸರಬರಾಜುದಾರರು',
  'Analytics': 'ವಿಶ್ಲೇಷಣೆ',
  'Settings': 'ಸೆಟ್ಟಿಂಗ್ಸ್',
  'Translator': 'ಅನುವಾದಕ',
  'Categories': 'ವರ್ಗಗಳು',
  'Varieties': 'ವೈವಿಧ್ಯಗಳು',
  'Advertisements': 'ಜಾಹೀರಾತುಗಳು',
  'Platform Config': 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸೆಟ್ಟಿಂಗ್ಸ್',
  'Change Password': 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಿ',
  'Logout': 'ಲಾಗ್ ಔಟ್',
  
  // Common Actions
  'Add': 'ಸೇರಿಸಿ',
  'Edit': 'ಸಂಪಾದಿಸಿ',
  'Delete': 'ಅಳಿಸಿ',
  'Save': 'ಉಳಿಸಿ',
  'Cancel': 'ರದ್ದುಮಾಡಿ',
  'Search': 'ಹುಡುಕಿ',
  'Filter': 'ಫಿಲ್ಟರ್',
  
  // Status
  'Pending': 'ಬಾಕಿ',
  'Approved': 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
  'Rejected': 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
  'Active': 'ಸಕ್ರಿಯ',
  'Inactive': 'ನಿಷ್ಕ್ರಿಯ',
};

/**
 * Translate text to Kannada if available, otherwise return original
 * @param {string} text - English text to translate
 * @param {boolean} enabled - Whether translation is enabled (default: false for now)
 * @returns {string} - Translated text or original
 */
export function translate(text, enabled = false) {
  if (!enabled || !text) return text;
  return translations[text] || text;
}

/**
 * Get all available translations
 */
export function getTranslations() {
  return translations;
}

/**
 * Check if Kannada translation is enabled
 * This can be controlled by user preference or admin setting
 */
export function isKannadaEnabled() {
  // For now, return false. Can be controlled by localStorage or user preference
  return localStorage.getItem('admin_language') === 'kannada';
}

export default {
  translate,
  getTranslations,
  isKannadaEnabled,
};
