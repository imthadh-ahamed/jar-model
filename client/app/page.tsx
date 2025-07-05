'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'
import LoadingSpinner from '@/components/LoadingSpinner'
import ResultCard from '@/components/ResultCard'

interface FormData {
  alkalinity: number
  hardness: number
  ph: number
  solids: number
  chloramines: number
  conductivity: number
  organic_carbon: number
  trihalomethanes: number
  turbidity: number
}

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
  input?: Record<string, number>
  timestamp?: string
  processing_time_ms?: number
}

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post('/api/predict', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        setResult(response.data.data)
        toast.success('Prediction completed successfully!')
      } else {
        throw new Error(response.data.error || 'Prediction failed')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    reset()
    setResult(null)
    setError(null)
  }

  return (
    <div className="px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Water Treatment Parameter Prediction
          </h1>
          <p className="text-lg text-gray-600">
            Enter water quality parameters to predict treatment outcomes using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Water Quality Parameters
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alkalinity (mg/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('alkalinity', { 
                    required: 'Alkalinity is required',
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 204.89"
                />
                {errors.alkalinity && (
                  <p className="text-red-500 text-sm mt-1">{errors.alkalinity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hardness (mg/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('hardness', { 
                    required: 'Hardness is required',
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 204.89"
                />
                {errors.hardness && (
                  <p className="text-red-500 text-sm mt-1">{errors.hardness.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  pH
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('ph', { 
                    required: 'pH is required',
                    min: { value: 0, message: 'pH must be positive' },
                    max: { value: 14, message: 'pH must be <= 14' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3.72"
                />
                {errors.ph && (
                  <p className="text-red-500 text-sm mt-1">{errors.ph.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solids (mg/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('solids', { 
                    required: 'Solids is required',
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20791.32"
                />
                {errors.solids && (
                  <p className="text-red-500 text-sm mt-1">{errors.solids.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chloramines (mg/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('chloramines', { 
                    required: 'Chloramines is required',
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 7.30"
                />
                {errors.chloramines && (
                  <p className="text-red-500 text-sm mt-1">{errors.chloramines.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conductivity (μS/cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('conductivity', { 
                    required: 'Conductivity is required',
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 421.50"
                />
                {errors.conductivity && (
                  <p className="text-red-500 text-sm mt-1">{errors.conductivity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organic Carbon (mg/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('organic_carbon', { 
                    required: 'Organic Carbon is required',
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 14.28"
                />
                {errors.organic_carbon && (
                  <p className="text-red-500 text-sm mt-1">{errors.organic_carbon.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trihalomethanes (μg/L)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('trihalomethanes', { 
                    required: 'Trihalomethanes is required',
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 66.42"
                />
                {errors.trihalomethanes && (
                  <p className="text-red-500 text-sm mt-1">{errors.trihalomethanes.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turbidity (NTU)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('turbidity', { 
                    required: 'Turbidity is required',
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 4.50"
                />
                {errors.turbidity && (
                  <p className="text-red-500 text-sm mt-1">{errors.turbidity.message}</p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner />
                      <span className="ml-2">Predicting...</span>
                    </div>
                  ) : (
                    'Predict Treatment Parameters'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Prediction Results
            </h2>
            
            {loading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-2 text-gray-600">Processing your request...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Prediction Error
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && <ResultCard result={result} />}

            {!loading && !error && !result && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">
                  Enter water quality parameters and click "Predict" to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
