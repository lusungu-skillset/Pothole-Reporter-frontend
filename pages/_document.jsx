import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b64d1" />
        <meta name="description" content="Pothole Reporting Web Application" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
