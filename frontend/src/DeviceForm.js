import React, { useState } from "react";
import axios from "axios";

function DeviceForm({ onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    ip_address: "",
    location: "",
    device_type: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://192.168.1.11:8000/devices", {
        ...formData,
        is_online: false,
        last_ping: null,
      });
      onAdd(); // Para recargar la tabla
      setFormData({
        name: "",
        ip_address: "",
        location: "",
        device_type: "",
        notes: "",
      });
    } catch (err) {
      alert("Error al añadir dispositivo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h4>Añadir dispositivo</h4>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" required />
      <input name="ip_address" value={formData.ip_address} onChange={handleChange} placeholder="IP" required />
      <input name="location" value={formData.location} onChange={handleChange} placeholder="Ubicación" />
      <input name="device_type" value={formData.device_type} onChange={handleChange} placeholder="Tipo" />
      <input name="notes" value={formData.notes} onChange={handleChange} placeholder="Notas" />
      <button type="submit">Añadir</button>
    </form>
  );
}

export default DeviceForm;
