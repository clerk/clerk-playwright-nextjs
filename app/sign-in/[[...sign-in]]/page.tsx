import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div>
      <h1>Sign In</h1>
      <SignIn path="/sign-in" routing="path" />
    </div>
  );
}
