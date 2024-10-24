'use client';
import { AccountStatus } from "@/utils/AccountStatus";
import Link from "next/link";
import { useRef, useState } from "react";

interface RegisterPageProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    onRegister: (token: string) => Promise<void> | void,
};

export default function RegisterPage(props: RegisterPageProps) {

    // NOTE: When adding a new prop, add them to this.
    // I spent about 2 hours trying to find a way to dynamically do this without having to specify all the props,
    // but was unable to figure it out.
    const { onRegister, ...divProps } = props;

    const [message, setMessage] = useState<string>("");
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const accountTypeRef = useRef<HTMLSelectElement | null>(null);

    /**
     * The callback for when the user tries to create an account.
     * @param event The submit event.
     */
    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("Registering...");

        // Do post request to login here
        try {
            const response = await fetch("//localhost:8000/createAccount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: usernameRef.current!.value,      // Force assume current.value is valid
                    password: passwordRef.current!.value,      // Force assume current.value is valid
                    accountType: accountTypeRef.current!.value // Force assume current.value is valid
                })
            });
            if (!response.ok) {
                // There was a bad response
                if (response.status === 400) {
                    // Handle 400 response
                    const errorMessage = await response.json();
                    throw new Error(errorMessage.error);
                }

                // Other, unknown error
                const errorMessage = await response.json();
                throw new Error(errorMessage);
            }

            // Response is ok (success)
            // TODO: Add items type definition and bids type definition here
            const data: {token: string, username: string, status: AccountStatus, profit: number, items: unknown[]} | {token: string, username: string, funds: number, bids: unknown[]} = await response.json();
            // TODO: Might want to add a Promise to Register to handle errors
            await onRegister(data.token);
            setMessage("Registered!");
        } catch (error) {
            // Handle error thrown
            if (error instanceof Error) {
                console.error("Error while creating an account: " + error.message);
                setMessage("Error while creating an account: " + error.message);
            } else {
                // A non-Error error was thrown.
                console.error("An unknown error has occurred.");
                setMessage("An unknown error has occurred.");
            }
        }
    }

    return (
        <div {...divProps}>
            <form onSubmit={handleSubmit}>
                <div>
                    <div>
                        <label className="text-lg select-none" htmlFor="username">Username</label>
                    </div>
                    <input className="input input-bordered w-full max-w-xs max-h-9 input-primary focus:outline-accent"
                        type="text" name="username" autoComplete="username" data-length="20" required
                        ref={usernameRef}></input>
                </div>
                <div className="mb-2">
                    <div>
                        <label className="text-lg select-none" htmlFor="password">Password</label>
                    </div>
                    <input className="input input-bordered w-full max-w-xs max-h-9 input-primary focus:outline-accent"
                        type="password" name="password" autoComplete="current-password" required
                        ref={passwordRef}></input>
                </div>
                <div className="mb-2">
                    <div>
                        <label className="text-lg select-none" htmlFor="accountType">Account Type:</label>
                    </div>
                    <select className="select-none" name="accountType" ref={accountTypeRef}>
                        <option value="Buyer">Buyer</option>
                        <option value="Seller">Seller</option>
                    </select>
                </div>
                <div>
                    <button className="btn btn-primary" type="submit" name="createAccountButton">
                        Create Account
                    </button>
                </div>
                <div>
                    <p>Existing user? <Link href="/login">Sign in</Link></p>
                </div>
            </form>
            <div className="text-xl">{message}</div>
            {props.children}
        </div>
    );
}