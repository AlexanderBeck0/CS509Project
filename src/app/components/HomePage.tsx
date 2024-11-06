import React, { useState, useEffect } from 'react';
import ItemDisplay from './ItemDisplay';

export default function HomePage(props: { searchInput: string, sortBy: string }) {
  const [result, setResult] = useState<any[]>([]);

  useEffect(() => {
    console.log("Search: " + props.searchInput);
    console.log("Sort: " + props.sortBy);
    const fetchData = async () => {
      const payload = {
        query: props.searchInput, // need to get all items sorted by some default
        sortBy: props.sortBy,
      };
      try {
        const response = await fetch('https://bgsfn1wls6.execute-api.us-east-1.amazonaws.com/initial/searchItems',
          {
            method: 'POST',
            body: JSON.stringify(payload),
          });

        const resultData = await response.json();
        console.log(resultData);
        if (resultData.statusCode == 200) {
          setResult(resultData.items);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [props.searchInput, props.sortBy]);

  return (
    <div className="ItemDisplay">
      {result.length > 0 ? (
        result.map((item, index) => (
          <ItemDisplay key={index} item={item}/>
        ))
      ) : (
        <p>No items found.</p>
      )}
    </div>
  );
}