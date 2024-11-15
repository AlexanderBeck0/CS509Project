import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Item } from '@/utils/types';

export default function EditItemPage() {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<Item | null>(null);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                // TODO: Add API URL here
                const response = await fetch("URL HERE", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        id: id
                    })
                });

                const data: { statusCode: 200, item: Item } | { statusCode: 400 | 500, error: string } = await response.json();
                if (data.statusCode !== 200) {
                    alert("Error fetching item: " + data.error);
                    throw data.error;
                }

                setItem(data.item);
            } catch (error) {
                console.error(error instanceof Error ? error.message : error);
                alert(error);
            }
        };
        fetchItem();
    }, [id]);

    return (
        <></>
    );
}