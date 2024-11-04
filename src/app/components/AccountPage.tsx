import SellerPage from './SellerPage';
import AdminPage from './AdminPage';
import { AccountType } from '@/utils/types';

interface AccountPageProps {
    accountType: AccountType | null;
    logout: () => void;
}

export default function AccountPage(props: AccountPageProps) {

    /**
     * Closes the user's account and logs them out.
     */
    async function closeAccount() {
        try {
            const response = await fetch("https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/closeAccount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            });

            const data = await response.json();
            if (data.error) {
                // TODO: Show the user this error with a message somehow
                console.error(data.error);
                return;
            }

            if (data.valid) {
                // Log the user out if closing the account was successful
                // TODO: Add a message to logout to show to the user?
                props.logout();
            }
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
        }
    }

    if (props.accountType === "Seller") {
        return (
            <SellerPage logout={props.logout} closeAccount={closeAccount} />
        );
    } else if (props.accountType === "Buyer") {
        return (
            // Seller page until buyer page is complete
            <SellerPage logout={props.logout} />
            // TODO Return Buyer page
        );
    } else if (props.accountType === "Admin") {
        return (
            <AdminPage logout={props.logout} />
        );
    } else {
        return (
            <div>
                Account page
            </div>
        );
    }
}