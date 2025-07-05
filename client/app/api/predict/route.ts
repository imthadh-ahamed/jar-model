import { NextRequest, NextResponse } from 'next/server'

const NODE_BACKEND_URL = process.env.NODE_BACKEND_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'alkalinity', 'hardness', 'ph', 'solids', 'chloramines', 
      'conductivity', 'organic_carbon', 'trihalomethanes', 'turbidity'
    ]
    
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
      
      if (isNaN(parseFloat(body[field]))) {
        return NextResponse.json(
          { success: false, error: `Invalid value for field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Forward request to Node.js backend
    const response = await fetch(`${NODE_BACKEND_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Prediction failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Water Treatment Prediction API',
    endpoint: 'POST /api/predict'
  })
}
