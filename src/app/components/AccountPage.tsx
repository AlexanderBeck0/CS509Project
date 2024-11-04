import SellerPage from './SellerPage';
import AdminPage from './AdminPage';
import { AccountType } from '@/utils/types';

interface AccountPageProps {
    accountType: AccountType | null;
    logout: () => void;
}

export default function AccountPage(props: AccountPageProps) {

    if (props.accountType === "Seller") {
        return (
            <SellerPage logout={props.logout} />
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