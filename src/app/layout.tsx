import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Video Generator',
  description: 'Create UGC videos with AI - Simple, Fast, Effective',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" />
        <Script
          id="endorsely-tracking"
          src="https://assets.endorsely.com/endorsely.js"
          data-endorsely="309354b9-da59-40c5-862b-aa38f726c80c"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
