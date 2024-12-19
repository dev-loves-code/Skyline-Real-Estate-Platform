import { createContext, useEffect, useState } from "react";

export const Context = createContext(null);

const ContextProvider = (props) => {
  // State for properties fetched from assets.json
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      fetchFavorites();
      fetchLikes();
    }

  }, []);


  

  const fetchProperties = async () => {
    try {

      const queryParams = ""; 

      const response = await fetch(`http://localhost:5000/properties?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await response.json();
      console.log("Fetched properties:", data);
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      alert("Failed to fetch properties. Please try again.");
    }
  };
  

  
  const [favoriteItems, setFavItems] = useState({});

  const [LikedItems, setLikedItems] = useState({});

  



   const toggleLike = async (propertyId) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("User not found. Please log in.");
        return;
      }
  
      const { name: username } = JSON.parse(storedUser); // Extract `name` as `username`
  
      // Optimistically update UI before API call
      setLikedItems((prev) => ({
        ...prev,
        [propertyId]: !prev[propertyId], // Toggle true/false
      }));
  
      // Make the POST request
      const response = await fetch(
        `http://localhost:5000/likes/${propertyId}/${username}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }
  
      const data = await response.json();
      console.log(data.message); // Logs backend response ("added" or "removed")
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite. Please try again.");
    }
  };



  const fetchFavorites = async () => {

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
    
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("User not found. Please log in.");
        return;
      }
  
      const { name: username } = JSON.parse(storedUser);
  
      const response = await fetch(`http://localhost:5000/favorites/${username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }
  
      const data = await response.json();
      console.log("Fetched favorite properties:", data);
  
      // Update favorite items state
      const favoriteIds = data.reduce((acc, property) => {
        acc[property.id] = true; // Mark as favorite
        return acc;
      }, {});
  
      setFavItems(favoriteIds);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      alert("Failed to fetch favorites. Please try again.");
    }
  }
  };

  const fetchLikes = async () => {

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
    
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("User not found. Please log in.");
        return;
      }
  
      const { name: username } = JSON.parse(storedUser);
  
      const response = await fetch(`http://localhost:5000/likes/${username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch favorites");
      }
  
      const data = await response.json();
      console.log("Fetched favorite properties:", data);
  
      // Update favorite items state
      const favoriteIds = data.reduce((acc, property) => {
        acc[property.id] = true; // Mark as favorite
        return acc;
      }, {});
  
      setLikedItems(favoriteIds);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      alert("Failed to fetch Likes. Please try again.");
    }
  }
  };
 
   
  const toggleFav = async (propertyId) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("User not found. Please log in.");
        return;
      }
  
      const { name: username } = JSON.parse(storedUser); // Extract `name` as `username`
  
      // Optimistically update UI before API call
      setFavItems((prev) => ({
        ...prev,
        [propertyId]: !prev[propertyId], // Toggle true/false
      }));
  
      // Make the POST request
      const response = await fetch(
        `http://localhost:5000/favorites/${propertyId}/${username}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }
  
      const data = await response.json();
      console.log(data.message); // Logs backend response ("added" or "removed")
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite. Please try again.");
    }
  };
  
  



  
  const contextValue = {
    properties,
    favoriteItems,
    toggleFav,
    LikedItems,
    toggleLike
    
  };

  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
