import type { NextPageContext } from 'next'

type Props = {
  statusCode?: number
}

/**
 * Pages Router fallback error page. App Router uses app/error.tsx for route errors;
 * Next still invokes /_error when rendering the dev error shell if the internal
 * compiled default is missing (e.g. stale .next). This file guarantees that route exists.
 */
export default function ErrorPage({ statusCode }: Props) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '40rem' }}>
      <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
        {statusCode ? `Error ${statusCode}` : 'An error occurred'}
      </h1>
      <p style={{ color: '#444' }}>Something went wrong while loading this page.</p>
    </div>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err && 'statusCode' in err ? err.statusCode : 404
  return { statusCode }
}
