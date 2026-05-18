// Standalone layout: does not include the customer Navbar/Footer or the
// admin sidebar — just renders the login page on a clean background.
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
