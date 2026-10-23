import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth.protect();

  return (
    <div>
      <h1>This is a PROTECTED page</h1>
      <p>Hi, {userId}!</p>
    </div>
  );
}
