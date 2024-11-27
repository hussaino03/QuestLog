export const validateUserId = (userId) => {
    try {
      if (!userId || typeof userId !== 'string' || userId.length !== 24) {
        console.log('❌ You are not authorized - Invalid user ID');
        throw new Error('Invalid user ID');
      }
      console.log('✅ You are authorized - Valid user ID');
    } catch (error) {
      console.error('Authorization Error:', error.message);
      throw error;
    }
  };