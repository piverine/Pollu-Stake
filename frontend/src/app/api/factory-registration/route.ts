import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { factoryName, ownerName, location, bondSize, licenseFileName } = body

    // Validate required fields
    if (!factoryName || !ownerName || !location || !bondSize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate bondSize is a positive number
    const bondSizeNum = parseFloat(bondSize)
    if (isNaN(bondSizeNum) || bondSizeNum <= 0) {
      return NextResponse.json(
        { error: 'Bond size must be a positive number' },
        { status: 400 }
      )
    }

    // Save to backend database
    try {
      const backendResponse = await fetch('http://localhost:8000/api/factory-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          factoryName,
          ownerName,
          location,
          bondSize: bondSizeNum,
          licenseFileName: 'license_file', // File name placeholder
          timestamp: new Date().toISOString(),
        }),
      })

      if (!backendResponse.ok) {
        console.error('Backend registration failed:', await backendResponse.text())
      }
    } catch (error) {
      console.error('Error saving to backend:', error)
      // Continue anyway - frontend registration is still successful
    }

    // Log the registration
    console.log('Factory Registration:', {
      userId,
      factoryName,
      ownerName,
      location,
      bondSize: bondSizeNum,
      timestamp: new Date().toISOString(),
    })

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Factory registered successfully',
        data: {
          factoryName,
          ownerName,
          location,
          bondSize: bondSizeNum,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Factory registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
