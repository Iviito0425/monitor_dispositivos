import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeviceForm from './DeviceForm';
import EditDeviceForm from './EditDeviceForm';
import Papa from 'papaparse';

function App() {
  const [devices, setDevices] = useState([]);
  const [editingDevice, setEditingDevice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDevices = async () => {
    try {
      const res = await axios.get("http://192.168.1.11:8000/devices");
      setDevices(res.data);
    } catch (error) {
      console.error("Error al cargar dispositivos", error);
    }
  };

  const deleteDevice = async (id) => {
    if (!window.confirm("¿Eliminar este dispositivo?")) return;
    try {
      await axios.delete(`http://192.168.1.11:8000/devices/${id}`);
      fetchDevices();
    } catch {
      alert("Error al eliminar el dispositivo");
    }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(devices);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dispositivos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case "router": return "📡";
      case "pc": return "🖥️";
      case "phone": return "📱";
      case "tv": return "📺";
      default: return "📦";
    }
  };

  const groupedByLocation = devices
    .filter((dev) =>
      Object.values(dev).join(" ").toLowerCase().includes(searchTerm)
    )
    .reduce((acc, dev) => {
      const loc = dev.location || "Sin ubicación";
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(dev);
      return acc;
    }, {});

  const online = devices.filter(d => d.is_online).length;
  const offline = devices.length - online;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📡 Monitor de Dispositivos</h1>

      {/* RESUMEN */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
        <div className="bg-green-600 px-6 py-4 rounded-xl shadow w-full sm:w-auto text-center">
          🟢 Online: <strong>{online}</strong>
        </div>
        <div className="bg-red-600 px-6 py-4 rounded-xl shadow w-full sm:w-auto text-center">
          🔴 Offline: <strong>{offline}</strong>
        </div>
        <div className="bg-blue-600 px-6 py-4 rounded-xl shadow w-full sm:w-auto text-center">
          🌐 Total: <strong>{devices.length}</strong>
        </div>
      </div>

      {/* BUSCADOR + EXPORTAR */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar dispositivo..."
          className="flex-1 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
        <button
          onClick={exportCSV}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* FORMULARIO */}
      {editingDevice ? (
        <EditDeviceForm
          device={editingDevice}
          onCancel={() => setEditingDevice(null)}
          onSave={() => {
            fetchDevices();
            setEditingDevice(null);
          }}
        />
      ) : (
        <DeviceForm onAdd={fetchDevices} />
      )}

      {/* GRUPOS POR UBICACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedByLocation).map(([location, group]) => (
          <div key={location}>
            <h3 className="text-xl font-semibold mb-3 border-b border-gray-600 pb-1">
              📍 {location}
            </h3>
            {group.map((dev) => (
              <div
                key={dev.id}
                className={`rounded-xl p-4 mb-4 shadow bg-gray-800 border-l-4 ${
                  dev.is_online ? "border-green-500" : "border-red-500"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold">{getIcon(dev.device_type)} {dev.name}</h4>
                    <p className="text-sm text-gray-400">
                      <span className="block">IP: {dev.ip_address}</span>
                      <span className="block">Tipo: {dev.device_type}</span>
                      <span className="block">
                        Estado:{" "}
                        <span className={dev.is_online ? "text-green-400" : "text-red-400"}>
                          {dev.is_online ? "🟢 Online" : "🔴 Offline"}
                        </span>
                      </span>
                      <span className="block">Último ping: {dev.last_ping ? new Date(dev.last_ping).toLocaleString() : "Nunca"}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => setEditingDevice(dev)}
                    >
                      ✏️
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => deleteDevice(dev.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
