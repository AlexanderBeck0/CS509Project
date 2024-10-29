import React, { useState, useEffect} from 'react';

export default function HomePage(props: {searchInput: String, sortBy: String}) {
    const [result, setResult] = useState(null);

    useEffect(() => {
      console.log("Search: "+props.searchInput);
      console.log("Sort: "+props.sortBy);
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
          if(resultData.statusCode == 200) {
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
            {/*do something with result here*/}
        </div>
    );
}