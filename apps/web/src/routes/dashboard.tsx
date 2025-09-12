import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { api } from "@ocw-convex/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useMutation,
	useQuery,
} from "convex/react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const privateData = useQuery(api.privateData.get);
	const user = useUser();
	const migrate = useMutation(api.convertIds.migrateRelations);
	const [isRunning, setIsRunning] = useState(false);
	const [result, setResult] = useState<null | {
  updated: Record<string, number>;
  notFound: Record<string, number>;
}>(null);

	async function handleMigrate() {
  setIsRunning(true);
  try {
    const res = await migrate({});
    setResult(res as typeof result extends infer T ? T : never);
  } finally {
    setIsRunning(false);
  }
}

	return (
		<>
			<Authenticated>
				<div>
					<h1>Dashboard</h1>
					<p>Welcome {user.user?.fullName}</p>
					<p>privateData: {privateData?.message}</p>
					<UserButton />
					<div style={{ marginTop: 16 }}>
						<button type="button" onClick={handleMigrate} disabled={isRunning}>
							{isRunning ? "Migrating…" : "Run relation ID migration"}
						</button>
						{result && (
							<div style={{ marginTop: 8 }}>
								<strong>Updated</strong>: {Object.entries(result.updated).map(([k, v]) => `${k}:${v}`).join(", ")}
								<br />
								<strong>Not found</strong>: {Object.entries(result.notFound).map(([k, v]) => `${k}:${v}`).join(", ")}
							</div>
						)}
					</div>
				</div>
			</Authenticated>
			<Unauthenticated>
				<SignInButton />
			</Unauthenticated>
			<AuthLoading>
				<div>Loading...</div>
			</AuthLoading>
		</>
	);
}
