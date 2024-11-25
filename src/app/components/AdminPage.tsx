import Image from 'next/image';
import { ReactNode, useRef, useState } from 'react';
import AdminSQL from './AdminSQL';

interface AccountPageProps {
    logout: () => void;
}

export default function AdminPage(props: AccountPageProps) {
    const [sqlOpen,setSqlOpen] = useState(false);
    /**
     * Used to call `logout()`
     * @param event The event object.
     */
    const handleLogout = () => {
        props.logout();
    };

    const toggleSQL = () => {
        setSqlOpen(!sqlOpen);
    }

    return (
        <div className='flex flex-col items-center justify-center space-y-4'>
            <div> {/* heading of admin */}
                <Image src="/accountSymbol.png" alt="Admin Account Symbol" width={100} height={100} style={{ objectFit: "contain" }} />
                <p><b>ADMIN PAGE</b></p>
            </div>
            <button className='accountButton' onClick={toggleSQL}>{sqlOpen ? "Close SQL" : "Open SQL"}</button>
            {sqlOpen ? <AdminSQL/> :
            <div>home</div>
            }
            <button className='accountButton' onClick={handleLogout}>Log out</button>
        </div>
    );
}