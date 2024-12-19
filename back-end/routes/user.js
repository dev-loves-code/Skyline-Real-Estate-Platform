const express = require("express");
const router = express.Router();
const db = require("../utils/database");

router.get("/properties", async (req, res) => {
  const { searchQuery, type, minPrice, maxPrice } = req.query;

  let query = "SELECT * FROM properties WHERE 1=1";
  const params = [];

  if (searchQuery) {
    query +=
      " AND (name LIKE ? OR description LIKE ? OR category LIKE ? OR location LIKE ?)";
    params.push(
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`
    );
  }

  if (type && (type === "rent" || type === "sale")) {
    query += " AND type = ?";
    params.push(type);
  }

  if (minPrice) {
    query += " AND price >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND price <= ?";
    params.push(maxPrice);
  }

  try {
    const [properties] = await db.execute(query, params);
    const [images] = await db.execute("SELECT * FROM images");

    const result = properties.map((property) => {
      const propertyImages = images
        .filter((image) => image.propertyId === property.id)
        .map((image) => image.imagePath);

      return {
        id: property.id,
        numberOfBedrooms: property.numberOfBedrooms,
        category: property.category,
        numberOfBathrooms: property.numberOfBathrooms,
        price: property.price,
        location: property.location,
        name: property.name,
        description: property.description,
        images: propertyImages,
        type: property.type,
        latitude: property.latitude,
        longitude: property.longitude,
        agentId: property.agentId,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching properties." });
  }
});

router.get("/properties/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [properties] = await db.execute(
      "SELECT * FROM properties WHERE id = ?",
      [id]
    );
    const [images] = await db.execute(
      "SELECT * FROM images WHERE propertyId = ?",
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    const property = properties[0];
    const propertyImages = images.map((image) => image.imagePath);

    const result = {
      id: property.id,
      numberOfBedrooms: property.numberOfBedrooms,
      category: property.category,
      numberOfBathrooms: property.numberOfBathrooms,
      price: property.price,
      location: property.location,
      name: property.name,
      description: property.description,
      images: propertyImages,
      type: property.type,
      latitude: property.latitude,
      longitude: property.longitude,
      agentId: property.agentId,
      interior: property.interior,
      exterior: property.exterior,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching property:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the property." });
  }
});

router.get("/agents/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [agents] = await db.execute(
      "SELECT * FROM agents WHERE agentId = ?",
      [id]
    );

    if (agents.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const agent = agents[0];

    res.status(200).json({
      id: agent.agentId,
      name: agent.name,
      email: agent.email,
      picture: agent.picture,
    });
  } catch (error) {
    console.error("Error fetching agent details:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the agent details." });
  }
});

router.post("/favorites/:id/:user", async (req, res) => {
  try {
    const { id, user } = req.params;
    console.log("Received request to toggle favorite:", { id, user });

    const [fav] = await db.execute(
      "select * from favorites where property_id=? AND user_name=?",
      [id, user]
    );

    if (fav.length > 0) {
      console.log("Favorite exists, removing...");
      await db.execute(
        "delete from favorites where property_id=? AND user_name=?",
        [id, user]
      );
      return res.status(200).json({
        add: false,
        message: "Removed from favorites",
      });
    }

    console.log("Favorite does not exist, adding...");
    await db.execute(
      "insert into favorites (property_id, user_name) values (?, ?)",
      [id, user]
    );
    return res.status(200).json({
      add: true,
      message: "Added to favorites",
    });
  } catch (error) {
    console.error("Error in favorite functionality:", error);
    res.status(500).json({ error: "An error occurred, not your favorite :(" });
  }
});

router.get("/favorites/:user", async (req, res) => {
  try {
    const { user } = req.params;
    console.log("Fetching favorites for user:", user);

    // Query to get favorite properties by user
    const [favorites] = await db.execute(
      `SELECT p.* 
       FROM properties p
       JOIN favorites f ON p.id = f.property_id
       WHERE f.user_name = ?`,
      [user]
    );

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Error retrieving favorites:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching favorites" });
  }
});

router.get("/bookings/:user", async (req, res) => {
  try {
    const { user } = req.params;
    console.log("Fetching bookings for user:", user);

    // Query to get favorite properties by user
    const [favorites] = await db.execute(
      `SELECT p.* , b.checkInDate, b.checkOutDate,b.totalPrice
       FROM properties p
       JOIN bookings b ON p.id = b.propertyId
       Join users u ON b.userId=u.id
       WHERE u.name = ?`,
      [user]
    );

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching bookings" });
  }
});

router.get("/reservations/:user", async (req, res) => {
  try {
    const { user } = req.params;
    console.log("Fetching reservations for user:", user);

    // Query to get favorite properties by user
    const [favorites] = await db.execute(
      `SELECT p.* , r.reservationDate,a.email
       FROM properties p
       JOIN reservations r ON p.id = r.propertyId
       Join users u ON r.userId=u.id
       JOIN agents a ON p.agentId=a.agentId
       WHERE u.name = ?`,
      [user]
    );

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Error retrieving reservations:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching reservations" });
  }
});

router.post("/likes/:id/:user", async (req, res) => {
  try {
    const { id, user } = req.params;
    console.log("Received request to toggle favorite:", { id, user });

    const [fav] = await db.execute(
      "select * from likes where property_id=? AND user_name=?",
      [id, user]
    );

    if (fav.length > 0) {
      console.log("Favorite exists, removing...");
      await db.execute(
        "delete from likes where property_id=? AND user_name=?",
        [id, user]
      );
      return res.status(200).json({
        add: false,
        message: "Removed from favorites",
      });
    }

    console.log("Favorite does not exist, adding...");
    await db.execute(
      "insert into likes (property_id, user_name) values (?, ?)",
      [id, user]
    );
    return res.status(200).json({
      add: true,
      message: "Added to favorites",
    });
  } catch (error) {
    console.error("Error in favorite functionality:", error);
    res.status(500).json({ error: "An error occurred, not your favorite :(" });
  }
});

router.get("/likes/:user", async (req, res) => {
  try {
    const { user } = req.params;
    console.log("Fetching favorites for user:", user);

    // Query to get favorite properties by user
    const [favorites] = await db.execute(
      `SELECT p.* 
       FROM properties p
       JOIN likes f ON p.id = f.property_id
       WHERE f.user_name = ?`,
      [user]
    );

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Error retrieving favorites:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching favorites" });
  }
});

module.exports = router;
