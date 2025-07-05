# Water Treatment Prediction Frontend

A modern Next.js frontend for the water treatment parameter prediction system. This application provides a clean, user-friendly interface for inputting water quality parameters and displaying AI-powered predictions.

## Features

- 🎨 **Modern UI**: Clean, responsive design using Tailwind CSS
- 📋 **Form Validation**: Real-time form validation with React Hook Form
- 🔄 **Loading States**: Smooth loading indicators and error handling
- 📊 **Results Display**: Interactive prediction results with confidence scores
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 🎯 **Feature Importance**: Visual display of most important prediction factors

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```bash
   NODE_BACKEND_URL=http://localhost:3001
   NEXT_PUBLIC_APP_NAME=Water Treatment Prediction App
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## Docker Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t water-treatment-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e NODE_BACKEND_URL=http://localhost:3001 \
     water-treatment-frontend
   ```

## API Integration

The frontend communicates with the Node.js backend through the following flow:

1. **Frontend Form** → `/api/predict` (Next.js API route)
2. **Next.js API** → `http://localhost:3001/api/predict` (Node.js backend)
3. **Node.js Backend** → `http://localhost:5000/predict` (Python FastAPI)

### Expected Input Format

```json
{
  "alkalinity": 204.89,
  "hardness": 204.89,
  "ph": 3.72,
  "solids": 20791.32,
  "chloramines": 7.30,
  "conductivity": 421.50,
  "organic_carbon": 14.28,
  "trihalomethanes": 66.42,
  "turbidity": 4.50
}
```

### Expected Response Format

```json
{
  "success": true,
  "data": {
    "predictions": {
      "ph": 7.2,
      "turbidity": 1.8,
      "colour": 12.5
    },
    "confidence": {
      "ph": 0.85,
      "turbidity": 0.92,
      "colour": 0.78
    },
    "feature_importance": {
      "alkalinity": 0.15,
      "hardness": 0.12,
      "ph": 0.18,
      "solids": 0.08,
      "chloramines": 0.10,
      "conductivity": 0.14,
      "organic_carbon": 0.11,
      "trihalomethanes": 0.07,
      "turbidity": 0.05
    }
  }
}
```

## Project Structure

```
frontend-nextjs/
├── app/
│   ├── api/
│   │   └── predict/
│   │       └── route.ts          # API endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page
│   └── globals.css               # Global styles
├── components/
│   ├── LoadingSpinner.tsx        # Loading component
│   └── ResultCard.tsx            # Results display
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── package.json                 # Dependencies
└── Dockerfile                   # Container configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_BACKEND_URL` | URL of the Node.js backend | `http://localhost:3001` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Water Treatment Prediction App` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |

## Form Validation

The application includes comprehensive form validation:

- **Required Fields**: All water quality parameters are required
- **Numeric Validation**: Ensures all values are valid numbers
- **Range Validation**: pH must be between 0-14
- **Positive Values**: Most parameters must be positive numbers
- **Real-time Feedback**: Immediate validation feedback for better UX

## Error Handling

- **Network Errors**: Graceful handling of connection issues
- **Validation Errors**: Clear error messages for invalid inputs
- **Server Errors**: User-friendly error messages for backend issues
- **Toast Notifications**: Non-intrusive error and success notifications

## Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
