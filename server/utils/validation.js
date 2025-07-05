const Joi = require('joi');

const predictionSchema = Joi.object({
  alkalinity: Joi.number().min(0).required()
    .messages({
      'number.base': 'alkalinity must be a number',
      'number.min': 'alkalinity must be non-negative',
      'any.required': 'alkalinity is required'
    }),
  
  hardness: Joi.number().min(0).required()
    .messages({
      'number.base': 'hardness must be a number',
      'number.min': 'hardness must be non-negative',
      'any.required': 'hardness is required'
    }),
  
  ph: Joi.number().min(0).max(14).required()
    .messages({
      'number.base': 'ph must be a number',
      'number.min': 'ph must be between 0 and 14',
      'number.max': 'ph must be between 0 and 14',
      'any.required': 'ph is required'
    }),
  
  solids: Joi.number().min(0).required()
    .messages({
      'number.base': 'solids must be a number',
      'number.min': 'solids must be non-negative',
      'any.required': 'solids is required'
    }),
  
  chloramines: Joi.number().min(0).required()
    .messages({
      'number.base': 'chloramines must be a number',
      'number.min': 'chloramines must be non-negative',
      'any.required': 'chloramines is required'
    }),
  
  conductivity: Joi.number().min(0).required()
    .messages({
      'number.base': 'conductivity must be a number',
      'number.min': 'conductivity must be non-negative',
      'any.required': 'conductivity is required'
    }),
  
  organic_carbon: Joi.number().min(0).required()
    .messages({
      'number.base': 'organic_carbon must be a number',
      'number.min': 'organic_carbon must be non-negative',
      'any.required': 'organic_carbon is required'
    }),
  
  trihalomethanes: Joi.number().min(0).required()
    .messages({
      'number.base': 'trihalomethanes must be a number',
      'number.min': 'trihalomethanes must be non-negative',
      'any.required': 'trihalomethanes is required'
    }),
  
  turbidity: Joi.number().min(0).required()
    .messages({
      'number.base': 'turbidity must be a number',
      'number.min': 'turbidity must be non-negative',
      'any.required': 'turbidity is required'
    })
});

const validatePredictionInput = (req, res, next) => {
  const { error, value } = predictionSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message,
      value: detail.context.value
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Invalid input data provided',
      validation_errors: validationErrors,
      required_fields: [
        'alkalinity (number, >= 0)',
        'hardness (number, >= 0)',
        'ph (number, 0-14)',
        'solids (number, >= 0)',
        'chloramines (number, >= 0)',
        'conductivity (number, >= 0)',
        'organic_carbon (number, >= 0)',
        'trihalomethanes (number, >= 0)',
        'turbidity (number, >= 0)'
      ]
    });
  }
  
  // Replace request body with validated and cleaned data
  req.body = value;
  next();
};

module.exports = {
  validatePredictionInput
};
