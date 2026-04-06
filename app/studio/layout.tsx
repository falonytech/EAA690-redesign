/**
 * Bare layout for the embedded Sanity Studio.
 * Overrides the root layout so the studio gets a clean full-page canvas
 * without the site navigation or footer.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
