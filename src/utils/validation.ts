export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateRatingData = (data: any): ValidationResult => {
  if (!data.name || !data.review || data.rating === undefined) {
    return {
      isValid: false,
      error: "Missing required fields: name, review, and rating are required"
    };
  }

  if (data.rating < 0 || data.rating > 10) {
    return {
      isValid: false,
      error: "Rating must be between 0 and 10"
    };
  }

  return { isValid: true };
};