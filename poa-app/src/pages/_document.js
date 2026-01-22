import { Html, Head, Main, NextScript } from "next/document";


export default function Document() {
  return (
    <>
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#000000" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
    </>
  );
}
