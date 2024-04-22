import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div>
      <h1>Sign Up</h1>
      <SignUp path="/sign-up" routing="path" />
    </div>
  );
}
