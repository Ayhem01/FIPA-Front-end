// import { useState, useEffect } from "react";

// const useFetchData = (url) => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(url, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`, // Ajouter le token si nécessaire
//             Accept: "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();
//         if (result.success) {
//           setData(result.data);
//         } else {
//           throw new Error(result.message || "Failed to fetch data");
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [url]);

//   return { data, loading, error };
// };

// export default useFetchData;