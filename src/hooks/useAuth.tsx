import { useUser, useClerk } from "@clerk/clerk-react";

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  return {
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          displayName:
            user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || "User",
        }
      : null,
    loading: !isLoaded,
    signOut: () => signOut(),
  };
}
