import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UX Design Readiness Checker',
  description: 'Analyze PRDs and user stories for UX design readiness',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900">{children}</body>
    </html>
  )
}