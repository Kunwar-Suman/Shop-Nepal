/**
 * Utility function to get full image URL
 * @param {string} imagePath - Image path from database
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, prepend API URL
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${apiUrl}${imagePath}`;
};

/**
 * Handle image load error by showing placeholder
 */
export const handleImageError = (e) => {
  e.target.style.display = 'none';
  const placeholder = e.target.nextElementSibling;
  if (placeholder && placeholder.classList.contains('placeholder-image')) {
    placeholder.style.display = 'flex';
  }
};
