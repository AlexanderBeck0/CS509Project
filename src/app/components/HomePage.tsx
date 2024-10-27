import React, { useState, useEffect} from 'react';

export default function HomePage() {
    const [result, setResult] = useState('');
    // get all items
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
          const payload = {
            query: "", // need to get all items sorted by some default
            sortBy: "endDate"
          };
          try {
            const response = await fetch('//localhost:8000/sortItems', 
            {
              method: 'POST',
              body: JSON.stringify(payload),
            });
            
          const resultData = await response.json();
          console.log(resultData)

        } catch (error) {
            console.error('Error fetching data:', error);
        }
        fetchData();
    }
    }, []);

    return (
        <div className="ItemDisplay">
            {result}
        </div>
    );
}