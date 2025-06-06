import React, { useState, useEffect } from "react";
import axios from "axios";

function EditDeviceForm({ device, onCancel, onUpdate }) {
  const [formData, setFormData] = useState({ ...device });

  useEffect(() => {
    setFormData({ ...device });
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
      await axios.put(`http://192.168.1.11:8000/devices/${device.id}`, {
        ...formData,
      });
      onUpdate();
      onCancel();
    } catch (err) {
      alert("Error al actualizar el dispositivo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h4 className="text-lg font-semibold mb-2">Editar dispositivo</h4>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" required />
      <input name="ip_address" value={formData.ip_address} onChange={handleChange} placeholder="IP" required />
      <input name="mac_address" value={formData.mac_address} onChange={handleChange} placeholder="MAC" />
      <select name="location" value={formData.location} onChange={handleChange}>
        <option value="">Selecciona una ubicación</option>
        <option value="Entrada">Entrada</option>
        <option value="Habitación">Habitación</option>
        <option value="Matrimonio">Matrimonio</option>
        <option value="Salón">Salón</option>
        <option value="Movible">Movible</option>
      </select>
      <input name="device_type" value={formData.device_type} onChange={handleChange} placeholder="Tipo" />
      <input name="notes" value={formData.notes} onChange={handleChange} placeholder="Notas" />
      <div className="mt-2 flex gap-2">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default EditDeviceForm;
