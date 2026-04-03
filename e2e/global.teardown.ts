import { createClerkClient } from "@clerk/backend";
import { test as teardown } from "@playwright/test";
import fs from "fs";
import path from "path";

const signUpUserFile = path.join(__dirname, "../playwright/.clerk/signup-user.json");

teardown("cleanup sign-up test user", async () => {
  if (!fs.existsSync(signUpUserFile)) {
    return;
  }

  const { userId } = JSON.parse(fs.readFileSync(signUpUserFile, "utf-8"));
  const client = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  await client.users.deleteUser(userId).catch(() => {});
  fs.unlinkSync(signUpUserFile);
});
