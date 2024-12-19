import React, { useState, useEffect } from "react";
import "./AgentsManagement.css";

export default function AgentsManagement() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profilePicture: null,
  });

  const [agents, setAgents] = useState([]);
  const [editingAgent, setEditingAgent] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/get-agents");
      const data = await response.json();
      console.log("Fetched agents:", data);
      setAgents(data);
    } catch (error) {
      console.error("Error fetching agents:", error);
      alert("Failed to fetch agents. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingAgent && !editingAgent.agentId) {
      console.error("No agent ID found for editing");
      alert("Error: Cannot edit agent without an ID");
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        if (key === "profilePicture" && formData[key] instanceof File) {
          data.append("picture", formData[key]);
        } else {
          data.append(key, formData[key]);
        }
      }
    }

    try {
      const url = editingAgent
        ? `http://localhost:5000/admin/edit-agent/${editingAgent.agentId}`
        : "http://localhost:5000/admin/add-agent";
      const method = editingAgent ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        alert(
          editingAgent
            ? "Agent updated successfully!"
            : "Agent added successfully!"
        );
        setFormData({
          name: "",
          email: "",
          profilePicture: null,
        });
        setEditingAgent(null);
        setIsAddingNew(false);
        fetchAgents();
      } else {
        const errorText = await response.text();
        alert(`Failed to submit agent: ${errorText}`);
      }
    } catch (error) {
      alert("An error occurred while adding/updating the agent.");
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name || "",
      email: agent.email || "",
      profilePicture: agent.profilePicture || null,
    });
    setIsAddingNew(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/admin/delete-agent/${deleteId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Agent deleted successfully!");
        setDeleteId(null);
        setIsDeleteModalOpen(false);
        fetchAgents();
      } else {
        const errorData = await response.json();
        alert(
          `Failed to delete agent: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      alert("An error occurred while deleting the agent.");
    }
  };

  const openDeleteConfirmation = (agentId) => {
    setDeleteId(agentId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingAgent(null);
    setFormData({
      name: "",
      email: "",
      profilePicture: null,
    });
  };

  return (
    <div className="page">
      <h1>Agent Management Page</h1>
      <div className="agent-management">
        <div className="form-section">
          {!isAddingNew && (
            <button onClick={handleAddNew} className="add-new-button">
              Add New Agent
            </button>
          )}

          {(isAddingNew || editingAgent) && (
            <form onSubmit={handleSubmit} className="form-container">
              <input
                type="text"
                name="name"
                placeholder="Enter agent name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
              />
              <input
                type="file"
                name="profilePicture"
                onChange={handleChange}
                accept="image/*"
                className="input-field"
              />
              {formData.profilePicture && (
                <img
                  src={URL.createObjectURL(formData.profilePicture)}
                  alt="Profile Preview"
                  className="profile-preview"
                />
              )}
              {editingAgent &&
                !formData.profilePicture &&
                editingAgent.profilePicture && (
                  <img
                    src={`http://localhost:5000/${editingAgent.profilePicture}`}
                    alt="Current Profile"
                    className="profile-preview"
                  />
                )}
              <button type="submit" className="submit-button">
                {editingAgent ? "Update Agent" : "Add Agent"}
              </button>
            </form>
          )}
        </div>

        <div className="agents-list-section">
          <h3>All Agents</h3>
          {agents.length > 0 ? (
            <table className="agents-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Profile Picture</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.agentId}>
                    <td>{agent.name}</td>
                    <td>{agent.email}</td>
                    <td>
                      {agent.picture && (
                        <img
                          src={`http://localhost:5000${agent.picture}`}
                          alt="Profile"
                          className="profile-thumbnail"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(agent)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(agent.agentId)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No agents available</p>
          )}
        </div>

        {isDeleteModalOpen && (
          <div className="delete-confirmation">
            <div className="delete-modal">
              <p>Are you sure you want to delete this agent?</p>
              <div className="modal-actions">
                <button onClick={handleDelete} className="delete-confirm">
                  Yes, Delete
                </button>
                <button
                  onClick={closeDeleteConfirmation}
                  className="cancel-delete"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
