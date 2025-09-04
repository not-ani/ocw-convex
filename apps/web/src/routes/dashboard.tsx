import { SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { api } from "@ocw-convex/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useQuery,
} from "convex/react";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const privateData = useQuery(api.privateData.get);
	const user = useUser();

	return (
		<>
			<Authenticated>
				<div>
					<h1>Dashboard</h1>
					<p>Welcome {user.user?.fullName}</p>
					<p>privateData: {privateData?.message}</p>
					<UserButton />
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
