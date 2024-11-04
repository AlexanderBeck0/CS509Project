import SellerPage from './SellerPage';
import AdminPage from './AdminPage';

interface AccountPageProps {
    accountType: string;
}

export default function AccountPage({ accountType }: AccountPageProps) {

    if (accountType === "seller") {
        return (
            <SellerPage />
        );
    } else if (accountType === "admin") {
        return (
            <AdminPage />
        )
    } else {
        return (
            <div>
                Account page
            </div>
        );
    }
}