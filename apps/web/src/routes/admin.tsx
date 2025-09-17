import { SignInButton, useUser } from "@clerk/clerk-react";
import { api } from "@ocw-convex/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const normalizeIds = useMutation(api.courses.normalizeUnitLengths);

  const navigate = useNavigate();
  const session = useUser();

  const isAdmin = session.user?.publicMetadata.role === "admin";

  if (!isAdmin) {
    navigate({ to: "/" });
  }
  return (
    <Auth>
      <main>
        <Button
          onClick={() => {
            normalizeIds();
          }}
        >
          Normalize that jawn
        </Button>
      </main>
    </Auth>
  );
}

function Auth({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Authenticated>{children}</Authenticated>{" "}
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <AuthLoading>Loading..</AuthLoading>
    </div>
  );
}
