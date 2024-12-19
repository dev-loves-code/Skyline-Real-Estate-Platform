const express = require("express");
const router = express.Router();
const upload = require("../config/MulterConfig");
const db = require("../utils/database");
const fs = require("fs");
const path = require("path");

router.post("/add-properties", upload.array("images", 10), async (req, res) => {
  try {
    const {
      name,
      numberOfBedrooms,
      numberOfBathrooms,
      interior,
      exterior,
      price,
      location,
      category,
      type,
      description,
      agentId,
      latitude,
      longitude,
    } = req.body;

    const images = req.files;

    if (!images || images.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    const [result] = await db.execute(
      `INSERT INTO Properties 
       (name, numberOfBedrooms, numberOfBathrooms, interior, exterior, price, location, category, type, description, agentId, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        numberOfBedrooms,
        numberOfBathrooms,
        interior,
        exterior,
        price,
        location,
        category,
        type,
        description,
        agentId,
        latitude,
        longitude,
      ]
    );

    const propertyId = result.insertId;

    const imageInsertPromises = images.map((image) =>
      db.execute(`INSERT INTO Images (propertyId, imagePath) VALUES (?, ?)`, [
        propertyId,
        `/uploads/images/${image.filename}`,
      ])
    );
    await Promise.all(imageInsertPromises);

    res.status(201).json({ message: "Property added successfully" });
  } catch (error) {
    console.error("Error adding property:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the property" });
  }
});

router.get("/get-properties", async (req, res) => {
  try {
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

    const [properties] = await db.execute(query, params);
    const [images] = await db.execute("SELECT * FROM images");

    const result = properties.map((property) => {
      const propertyImages = images
        .filter((image) => image.propertyId === property.id)
        .map((image) => image.imagePath);

      return {
        ...property,
        images: propertyImages,
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

router.put(
  "/edit-property/:id",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        numberOfBedrooms,
        numberOfBathrooms,
        interior,
        exterior,
        price,
        location,
        category,
        type,
        description,
        agentId,
        latitude,
        longitude,
      } = req.body;
      const images = req.files;

      await db.execute(
        `UPDATE Properties SET 
       name = ?, numberOfBedrooms = ?, numberOfBathrooms = ?, interior = ?, exterior = ?, price = ?, 
       location = ?, category = ?, type = ?, description = ?, agentId = ?, latitude = ?, longitude = ? 
       WHERE id = ?`,
        [
          name,
          numberOfBedrooms,
          numberOfBathrooms,
          interior,
          exterior,
          price,
          location,
          category,
          type,
          description,
          agentId,
          latitude,
          longitude,
          id,
        ]
      );

      if (images && images.length > 0) {
        await db.execute("DELETE FROM Images WHERE propertyId = ?", [id]);

        const imageInsertPromises = images.map((image) =>
          db.execute(
            "INSERT INTO Images (propertyId, imagePath) VALUES (?, ?)",
            [id, `/uploads/images/${image.filename}`]
          )
        );
        await Promise.all(imageInsertPromises);
      }

      res.status(200).json({ message: "Property updated successfully" });
    } catch (error) {
      console.error("Error updating property:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the property" });
    }
  }
);

router.delete("/delete-property/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [images] = await db.execute(
      "SELECT imagePath FROM Images WHERE propertyId = ?",
      [id]
    );

    images.forEach((image) => {
      const filePath = path.join(__dirname, "../..", image.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await db.execute("DELETE FROM Images WHERE propertyId = ?", [id]);
    await db.execute("DELETE FROM Properties WHERE id = ?", [id]);

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the property" });
  }
});

router.get("/get-agents", async (req, res) => {
  try {
    const [agents] = await db.execute("SELECT * FROM agents");
    res.status(200).json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "An error occurred while fetching agents." });
  }
});

router.post("/add-agent", upload.single("picture"), async (req, res) => {
  try {
    const { name, email } = req.body;
    const picture = req.file ? `/uploads/images/${req.file.filename}` : null;

    if (!name || !email || !picture) {
      return res.status(400).json({ error: "All fields are required." });
    }

    await db.execute(
      "INSERT INTO agents (name, email, picture) VALUES (?, ?, ?)",
      [name, email, picture]
    );

    res.status(201).json({ message: "Agent added successfully!" });
  } catch (error) {
    console.error("Error adding agent:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the agent." });
  }
});

router.put("/edit-agent/:id", upload.single("picture"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const picture = req.file ? `/uploads/images/${req.file.filename}` : null;

    const [rows] = await db.execute(
      "SELECT picture FROM agents WHERE agentId = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Agent not found." });
    }

    const currentPicture = rows[0].picture;

    await db.execute(
      `UPDATE agents SET name = ?, email = ?, picture = ? WHERE agentId = ?`,
      [name, email, picture || currentPicture, id]
    );

    if (picture && currentPicture !== picture) {
      const picturePath = path.join(__dirname, "../..", currentPicture);
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath);
      }
    }

    res.status(200).json({ message: "Agent updated successfully!" });
  } catch (error) {
    console.error("Error updating agent:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the agent." });
  }
});

router.delete("/delete-agent/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      "SELECT picture FROM agents WHERE agentId = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Agent not found." });
    }

    const picturePath = path.join(__dirname, "../..", rows[0].picture);

    await db.execute("DELETE FROM agents WHERE agentId = ?", [id]);

    if (fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath);
    }

    res.status(200).json({ message: "Agent deleted successfully!" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the agent." });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    // Query to get favorite properties by user
    const [favorites] = await db.execute(
      `SELECT p.* , b.checkInDate,b.checkOutDate,b.totalPrice,u.name AS userName
         FROM properties p
         JOIN bookings b ON p.id = b.propertyId
         Join users u ON b.userId=u.id`
    );
    console.log("Favorites data:", favorites);

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching bookings" });
  }
});

router.get("/reservations", async (req, res) => {
  try {
    const { user } = req.params;
    console.log("Fetching reservations for user:", user);

    // Query to get favorite properties by user
    const [favorites] = await db.execute(
      `SELECT p.* , r.reservationDate,u.name AS userName,a.name AS agentName
       FROM properties p
       JOIN reservations r ON p.id = r.propertyId
       Join users u ON r.userId=u.id
       JOIN agents a ON a.agentId=p.agentId`
    );

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Error retrieving reservations:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching reservations" });
  }
});

module.exports = router;
