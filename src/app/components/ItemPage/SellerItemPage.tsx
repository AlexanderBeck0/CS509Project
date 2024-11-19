import { useEffect, useState } from 'react';

interface SellerItemProps {
    status: string;
}

export default function SellerItemPage(props: SellerItemProps) {

    const [fulfill, setFulfill] = useState<boolean | null>(null)

    useEffect(() => {
        if (props.status === 'Fulfilled') {
            setFulfill(true);
        } else if (props.status === 'Completed') {
            setFulfill(false);
        }
    }, [props.status]);

    const handleFulfill = async () => {
        const payload = {
            token: localStorage.getItem('token'),
        };
        try {
            const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/fulfill',
                {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

            const resultData: { statusCode: 200, item_id: number } | { statusCode: 400, error: string } = await response.json();
            if (resultData.statusCode !== 200) throw new Error(resultData.error);
            if (resultData.statusCode == 200) {
                setFulfill(true);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div>
            {fulfill === null ? null : !fulfill ? (
                <button
                    style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', fontSize: '16px', border: 'none', borderRadius: '5px' }}
                    onClick={handleFulfill}
                >
                    Fulfill
                </button>
            ) : (
                <p>This item has been fulfilled, the funds deposited in your account</p>
            )}
        </div>
    );
}