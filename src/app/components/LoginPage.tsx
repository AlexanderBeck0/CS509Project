'use client';
import { Account, AccountType } from "@/utils/types";
import { useId, useRef, useState } from "react";
import { Link } from 'react-router-dom';

interface LoginPageProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    onLogin: (token: string, accountType: AccountType) => void,
};

export default function LoginPage(props: LoginPageProps) {

    // NOTE: When adding a new prop, add them to this.
    // I spent about 2 hours trying to find a way to dynamically do this without having to specify all the props,
    // but was unable to figure it out.
    const { onLogin, ...divProps } = props;

    const [message, setMessage] = useState<string>("");
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const usernameId = useId();
    const passwordId = useId();

    /**
     * The callback for when the user tries to login.
     * @param event The submit event.
     * @todo Not written
     */
    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("Logging in...");

        // Do post request to login here
        try {
            const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: usernameRef.current!.value, // Force assume current.value is valid
                    password: passwordRef.current!.value  // Force assume current.value is valid
                })
            });
            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage);
            }

            const json = await response.json();
            if (json['statusCode'] !== 200) {
                throw new Error(json['error']);
            }

            const data: { token: string } & Account = json.body;
            onLogin(data.token, data.accountType);
            setMessage(`Logged in as ${data.username}!`);
        } catch (error) {
            // Handle error thrown
            if (error instanceof Error) {
                console.warn("Error while logging in: " + error.message);
                setMessage("Error while logging in: " + error.message);
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
                        <label className="text-lg" htmlFor={usernameId}>Username</label>
                    </div>
                    <input className="input input-bordered w-full max-w-xs max-h-9 input-primary focus:outline-accent"
                        type="text" name="username" autoComplete="username" data-length="20" required
                        ref={usernameRef} id={usernameId}></input>
                </div>
                <div className="mb-2">
                    <div>
                        <label className="text-lg" htmlFor={passwordId}>Password</label>
                    </div>
                    <input className="input input-bordered w-full max-w-xs max-h-9 input-primary focus:outline-accent"
                        type="password" name="password" autoComplete="current-password" required
                        ref={passwordRef} id={passwordId}></input>
                </div>
                <div>
                    <button className="btn btn-primary" type="submit" name="loginButton">
                        Login
                    </button>
                </div>
            </form>
            <div>
                <p>New user? <Link to={"/createAccount"}>Create Account</Link></p>
            </div>
            <div className="text-xl">{message}</div>
            {props.children}
        </div>
    );
}