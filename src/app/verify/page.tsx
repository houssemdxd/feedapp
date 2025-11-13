// app/verify/page.tsx
export default function VerifyPage({ searchParams }: { searchParams: { status?: string }}) {
  const status = searchParams?.status ?? "unknown";
  return (
    <main style={{maxWidth:560,margin:"64px auto",fontFamily:"Inter,system-ui"}}>
      <h1>Email verification</h1>
      {status === "success" ? (
        <p>Your email is verified. You can now log in.</p>
      ) : (
        <p>{status}</p>
      )}
    </main>
  );
}
