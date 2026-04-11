import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate video file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file (MP4, WebM, OGG, or MOV)' },
        { status: 400 }
      )
    }

    const blob = await put(`videos/${file.name}`, file, {
      access: 'private',
    })

    // For private blobs, return the pathname to serve via API route
    return NextResponse.json({ pathname: blob.pathname })
  } catch (error) {
    console.error('[Omniweb] Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
