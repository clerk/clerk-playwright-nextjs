import { createClerkClient } from "@clerk/backend";
import { test as teardown } from "@playwright/test";
import fs from "fs";
import path from "path";

const signUpUserFile = path.join(__dirname, "../playwright/.clerk/signup-user.json");

teardown("cleanup sign-up test user", async () => {
  if (!fs.existsSync(signUpUserFile)) {
    return;
  }

  const { userId, email } = JSON.parse(
    fs.readFileSync(signUpUserFile, "utf-8"),
  );
  const client = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  try {
    await client.users.deleteUser(userId);
    fs.unlinkSync(signUpUserFile);
  } catch {
    // If delete by ID fails, try by email as fallback
    const { data: users } = await client.users.getUserList({
      emailAddress: [email],
    });
    for (const user of users) {
      await client.users.deleteUser(user.id);
    }
    fs.unlinkSync(signUpUserFile);
  }
});
