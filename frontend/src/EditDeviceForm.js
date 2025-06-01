import React, { useState, useEffect } from "react";
import axios from "axios";

function EditDeviceForm({ device, onCancel, onSave }) {
  const [formData, setFormData] = useState(device);

  useEffect(() => {
    setFormData(device);
  }, [device]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://192.168.1.11:8000/devices/${device.id}`, formData);
      onSave();
    } catch (err) {
      alert("Error al guardar los cambios");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h4>Editar dispositivo</h4>
      <input name="name" value={formData.name} onChange={handleChange} required />
      <input name="ip_address" value={formData.ip_address} onChange={handleChange} required />
      <input name="location" value={formData.location} onChange={handleChange} />
      <input name="device_type" value={formData.device_type} onChange={handleChange} />
      <input name="notes" value={formData.notes} onChange={handleChange} />
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  );
}

export default EditDeviceForm;
