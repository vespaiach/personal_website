import '@/app/ui/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="prose prose-stone lg:prose-xl dark:prose-invert p-5">{children}</body>
    </html>
  )
}
