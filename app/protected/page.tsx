import { auth } from "@clerk/nextjs/server";

export default function Page() {
  const { userId } = auth();

  return (
    <div>
      <h1>This is a PROTECTED page</h1>
      <p>Hi, {userId || "anonymous"}!</p>
    </div>
  );
}
