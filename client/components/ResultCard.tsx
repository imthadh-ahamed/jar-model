interface PredictionResult {
  predictions: {
    ph: number
    turbidity: number
    colour: number
  }
  confidence?: {
    ph?: number
    turbidity?: number
    colour?: number
  }
  feature_importance?: Record<string, number>
}

interface ResultCardProps {
  result: PredictionResult
}

export default function ResultCard({ result }: ResultCardProps) {
  const { predictions, confidence, feature_importance } = result

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <div className="space-y-6">
      {/* Predictions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Predicted Treatment Parameters
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="font-medium text-gray-700">pH Level</span>
            <div className="text-right">
              <span className="text-lg font-bold text-blue-600">
                {predictions.ph.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="font-medium text-gray-700">Turbidity (NTU)</span>
            <div className="text-right">
              <span className="text-lg font-bold text-green-600">
                {predictions.turbidity.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <span className="font-medium text-gray-700">Colour Level</span>
            <div className="text-right">
              <span className="text-lg font-bold text-purple-600">
                {predictions.colour.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      {feature_importance && Object.keys(feature_importance).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Most Important Factors
          </h3>
          <div className="space-y-2">
            {Object.entries(feature_importance)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([feature, importance]) => (
                <div key={feature} className="flex items-center">
                  <span className="text-sm text-gray-600 w-32 capitalize">
                    {feature.replace('_', ' ')}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 ml-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(importance * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    {(importance * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Interpretation
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>pH:</strong> {predictions.ph < 7 ? 'Acidic' : predictions.ph > 7 ? 'Alkaline' : 'Neutral'} 
            {predictions.ph < 6.5 || predictions.ph > 8.5 ? ' (Outside safe drinking water range)' : ' (Within safe drinking water range)'}
          </p>
          <p>
            <strong>Turbidity:</strong> {predictions.turbidity < 1 ? 'Excellent' : predictions.turbidity < 4 ? 'Good' : 'Poor'} water clarity
          </p>
          <p>
            <strong>Colour:</strong> {predictions.colour < 15 ? 'Low' : predictions.colour < 25 ? 'Moderate' : 'High'} colour level
          </p>
        </div>
      </div>
    </div>
  )
}
