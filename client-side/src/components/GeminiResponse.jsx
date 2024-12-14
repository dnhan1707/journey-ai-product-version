import { useEffect, useState } from "react";
// import LoadingPage from "./LoadingPage";

function GeminiResponse(props) {
    const [data, setData] = useState('');
    const [error, setError] = useState(null);
    // console.log("Props passed to gemini: ", props.command);
    const port = 5000;
    useEffect(() => {
        const fetchGeminiData = async () => {
            try {
                props.setLoading(true); // Use the setLoading prop
                // console.log("Fetching Gemini Data with command:", props.command); // Add this log

                const response = await fetch(`http://localhost:${port}/api/gemini/gemini_response`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ prompt: props.command })
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                props.onDataReceived(data.message);
                setData(data.message);
            } catch (error) {
                setError(error.message);
            } finally {
                props.setLoading(false); // Use the setLoading prop
            }
        };

        // if(!props.command){
        //     console.log("No command passed to GeminiResponse");
        // }

        if (props.command) {
            fetchGeminiData();
        }
    }, [props.command, props.setLoading, props.onDataReceived]);

    if (error) {
        return <p>Error: {error}</p>;
    }

    // return (
    //     <div className="GeminiResponse">
    //         {props.isLoading ? <LoadingPage /> : <p>{data}</p>}
    //     </div>
    // );
}


// Create function that deal with the response from the API using the place search


export default GeminiResponse;