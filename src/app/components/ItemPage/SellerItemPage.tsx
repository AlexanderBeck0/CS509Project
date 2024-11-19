import { useEffect, useState } from 'react';

interface SellerItemProps {
    status: string;
    item_id: number;
}

export default function SellerItemPage(props: SellerItemProps) {

    const [fulfill, setFulfill] = useState<boolean | null>(null)
    const [status, setStatus] = useState<string | null>(null)

    useEffect(() => {
        setStatus(props.status)
        if (props.status === 'Fulfilled') {
            setFulfill(true);
        } else if (props.status === 'Completed') {
            setFulfill(false);
        }
    }, [props.status]);

    useEffect(() => {
        if (fulfill) {
            setStatus('Fulfilled')
        }
    }, [fulfill]);

    const handleFulfill = async () => {
        const payload = {
            token: localStorage.getItem('token'),
            item_id: props.item_id
        };
        try {
            const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/fulfill',
                {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

            const resultData: { statusCode: 200, item_id: number } | { statusCode: 400, error: string } = await response.json();
            console.log(resultData)
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
            {fulfill !== null && !fulfill ? (
                <button
                    style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', fontSize: '16px', border: 'none', borderRadius: '5px' }}
                    onClick={handleFulfill}
                >
                    Fulfill
                </button>
            ) : fulfill !== null && status === 'Fulfilled' ? (
                <p>This item has been fulfilled, the funds deposited in your account</p>
            ) : null}
        </div>
    );
}