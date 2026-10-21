import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

async function Greeting() {
  const { userId } = await auth();

  return <p>Hi, {userId || "anonymous"}!</p>;
}

export default function Page() {
  return (
    <div>
      <h1>This is a PROTECTED page</h1>
      <Suspense>
        <Greeting />
      </Suspense>
    </div>
  );
}
