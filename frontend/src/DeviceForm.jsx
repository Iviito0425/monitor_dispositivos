import React, { useState } from "react";
import axios from "axios";

function DeviceForm({ onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    ip_address: "",
    mac_address: "",
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
      onAdd(); // recargar tabla
      setFormData({
        name: "",
        ip_address: "",
        mac_address: "",
        location: "",
        device_type: "",
        notes: "",
      });
    } catch (err) {
      alert("Error al añadir dispositivo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <h4 className="text-lg font-semibold mb-2">Añadir dispositivo</h4>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre"
          className="p-2 rounded bg-gray-900 text-white border"
          required
        />
        <input
          name="ip_address"
          value={formData.ip_address}
          onChange={handleChange}
          placeholder="IP"
          className="p-2 rounded bg-gray-900 text-white border"
          required
        />
        <input
          name="mac_address"
          value={formData.mac_address}
          onChange={handleChange}
          placeholder="Dirección MAC"
          className="p-2 rounded bg-gray-900 text-white border"
        />
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="p-2 rounded bg-gray-900 text-white border"
        >
          <option value="">Selecciona una ubicación</option>
          <option value="Entrada">Entrada</option>
          <option value="Habitación">Habitación</option>
          <option value="Matrimonio">Matrimonio</option>
          <option value="Salón">Salón</option>
          <option value="Movible">Movible</option>
        </select>
        <input
          name="device_type"
          value={formData.device_type}
          onChange={handleChange}
          placeholder="Tipo"
          className="p-2 rounded bg-gray-900 text-white border"
        />
        <input
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Notas"
          className="p-2 rounded bg-gray-900 text-white border"
        />
      </div>

      <button
        type="submit"
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Añadir
      </button>
    </form>
  );
}

export default DeviceForm;
