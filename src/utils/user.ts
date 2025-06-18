/**
 * Generate initials from email address
 * @param email - The email address
 * @returns Initials (first 2 characters of the email username part)
 */
export const getEmailInitials = (email: string): string => {
  if (!email) return 'U';
  const parts = email.split('@')[0];
  if (parts.length === 1) return parts[0].toUpperCase();
  return parts.substring(0, 2).toUpperCase();
};

/**
 * Generate initials from full name
 * @param fullName - The full name
 * @returns Initials (first letter of each word)
 */
export const getNameInitials = (fullName: string): string => {
  if (!fullName) return 'U';
  return fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Get user display name
 * @param user - User object
 * @returns Display name (full name or email username)
 */
export const getUserDisplayName = (user: any): string => {
  if (user?.full_name) return user.full_name;
  if (user?.email) return user.email.split('@')[0];
  return 'User';
}; 