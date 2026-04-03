import { createClerkClient } from "@clerk/backend";
import { test as teardown } from "@playwright/test";
import fs from "fs";
import path from "path";

const testUsersFile = path.join(__dirname, "../playwright/.clerk/signup-user.json");

teardown("cleanup test users", async () => {
  if (!fs.existsSync(testUsersFile)) {
    return;
  }

  const client = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  const data = JSON.parse(fs.readFileSync(testUsersFile, "utf-8"));
  // Support both array format (current) and legacy single-object format
  const users: { userId: string; email: string }[] = Array.isArray(data)
    ? data
    : [data];

  for (const { userId, email } of users) {
    try {
      await client.users.deleteUser(userId);
    } catch {
      // If delete by ID fails, try by email as fallback
      const { data: found } = await client.users.getUserList({
        emailAddress: [email],
      });
      for (const user of found) {
        await client.users.deleteUser(user.id);
      }
    }
  }

  fs.unlinkSync(testUsersFile);
});
