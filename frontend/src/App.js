import React, { useEffect, useState } from "react";
import DeviceForm from "./DeviceForm.jsx";

function App() {
  const [devices, setDevices] = useState([]);
  const [editingDevice, setEditingDevice] = useState(null);

  const fetchDevices = async () => {
    const res = await fetch("http://192.168.1.11:8000/devices");
    const data = await res.json();
    setDevices(data);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const groupedByLocation = devices.reduce((acc, device) => {
    const loc = device.location || "Sin ubicación";
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(device);
    return acc;
  }, {});

  const deleteDevice = async (id) => {
    await fetch(`http://192.168.1.11:8000/devices/${id}`, { method: "DELETE" });
    fetchDevices();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Monitor de Dispositivos</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <a
          href="http://192.168.1.11:8000/export/all"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          download
        >
          Exportar todos
        </a>
        <a
          href="http://192.168.1.11:8000/export/online"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          download
        >
          Exportar conectados
        </a>
        <a
          href="http://192.168.1.11:8000/export/offline"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          download
        >
          Exportar desconectados
        </a>
      </div>

      {editingDevice ? (
        <p>Función de edición no implementada aún</p>
      ) : (
        <DeviceForm onAdd={fetchDevices} />
      )}

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
                    <h4 className="text-lg font-bold">
                      {getIcon(dev.device_type)} {dev.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      <span className="block">IP: {dev.ip_address}</span>
                      <span className="block">MAC: {dev.mac_address}</span>
                      <span className="block">Tipo: {dev.device_type}</span>
                      <span className="block">
                        Estado:{" "}
                        <span
                          className={
                            dev.is_online ? "text-green-400" : "text-red-400"
                          }
                        >
                          {dev.is_online ? "🟢 Online" : "🔴 Offline"}
                        </span>
                      </span>
                      <span className="block">
                        Último ping:{" "}
                        {dev.last_ping
                          ? new Date(dev.last_ping).toLocaleString()
                          : "Nunca"}
                      </span>
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

function getIcon(type) {
  switch (type) {
    case "router":
      return "📡";
    case "switch":
      return "🔀";
    case "server":
      return "🖥️";
    case "printer":
      return "🖨️";
    default:
      return "🔌";
  }
}

export default App;
