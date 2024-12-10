/**
 * Custom error for invalid user ID format
 */
export class InvalidUserIdError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidUserIdError';
  }
}

/**
 * Validates MongoDB ObjectId format user ID
 * @param {string} userId - The user ID to validate
 * @returns {boolean} True if valid
 * @throws {InvalidUserIdError} If user ID is invalid
 */
export const validateUserId = (userId) => {
  try {
    // Check if userId exists and is string
    if (!userId || typeof userId !== 'string') {
      throw new InvalidUserIdError('User ID must be a non-empty string');
    }

    // Check length
    if (userId.length !== 24) {
      throw new InvalidUserIdError('User ID must be 24 characters long');
    }

    // Check if valid hex format (MongoDB ObjectId format)
    const validHexPattern = /^[0-9a-fA-F]{24}$/;
    if (!validHexPattern.test(userId)) {
      throw new InvalidUserIdError('User ID must contain only hexadecimal characters');
    }

    return true;

  } catch (error) {
    if (error instanceof InvalidUserIdError) {
      throw error;
    }
    throw new InvalidUserIdError('Invalid user ID: ' + error.message);
  }
};