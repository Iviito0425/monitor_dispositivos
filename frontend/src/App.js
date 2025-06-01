import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeviceForm from './DeviceForm';
import EditDeviceForm from './EditDeviceForm';
import Papa from 'papaparse';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  const [devices, setDevices] = useState([]);
  const [editingDevice, setEditingDevice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

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

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case "router": return <i className="bi bi-hdd-network"></i>;
      case "pc": return <i className="bi bi-pc-display"></i>;
      case "phone": return <i className="bi bi-phone"></i>;
      case "tv": return <i className="bi bi-tv"></i>;
      default: return <i className="bi bi-box"></i>;
    }
  };

  const total = devices.length;
  const online = devices.filter(d => d.is_online).length;
  const offline = total - online;

  const filteredDevices = devices
    .filter((dev) =>
      Object.values(dev).join(" ").toLowerCase().includes(searchTerm)
    )
    .sort((a, b) => {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      return typeof valA === "string"
        ? sortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA)
        : sortAsc
        ? valA - valB
        : valB - valA;
    });

  const groupedByLocation = filteredDevices.reduce((acc, dev) => {
    const loc = dev.location || "Sin ubicación";
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(dev);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <h1 className="mb-4">📡 Monitor de Dispositivos</h1>

      {/* RESUMEN */}
      <div className="row text-center mb-4">
        <div className="col-md-4">
          <div className="bg-success text-white rounded p-3">
            🟢 Online: <strong>{online}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-danger text-white rounded p-3">
            🔴 Offline: <strong>{offline}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-primary text-white rounded p-3">
            🌐 Total: <strong>{total}</strong>
          </div>
        </div>
      </div>

      {/* Buscador y exportar */}
      <div className="d-flex mb-3 gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Buscar dispositivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
        <button className="btn btn-success" onClick={exportCSV}>
          <i className="bi bi-download"></i> Exportar CSV
        </button>
      </div>

      {/* Formulario */}
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

      {/* Secciones por ubicación */}
      {Object.entries(groupedByLocation).map(([location, group]) => (
        <div key={location} className="mb-5">
          <h4 className="mt-4 text-secondary border-bottom pb-2">
            📍 {location}
          </h4>
          <table className="table table-hover mt-3">
            <thead className="table-dark">
              <tr>
                <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>Nombre</th>
                <th onClick={() => handleSort("ip_address")} style={{ cursor: "pointer" }}>IP</th>
                <th onClick={() => handleSort("device_type")} style={{ cursor: "pointer" }}>Tipo</th>
                <th onClick={() => handleSort("is_online")} style={{ cursor: "pointer" }}>Estado</th>
                <th onClick={() => handleSort("last_ping")} style={{ cursor: "pointer" }}>Último Ping</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {group.map((dev) => (
                <tr key={dev.id}>
                  <td>{dev.name}</td>
                  <td>{dev.ip_address}</td>
                  <td>{getIcon(dev.device_type)} {dev.device_type}</td>
                  <td className="text-center">
                    {dev.is_online ? (
                      <i className="bi bi-circle-fill fs-5" style={{ color: "limegreen" }} title="En línea"></i>
                   ) : (
                     <i className="bi bi-circle-fill fs-5" style={{ color: "red" }} title="Fuera de línea"></i>
                   )}
                  </td>

                  <td>{dev.last_ping ? new Date(dev.last_ping).toLocaleString() : 'Nunca'}</td>
                  <td>
                    <button className="btn btn-sm btn-primary me-1" onClick={() => setEditingDevice(dev)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteDevice(dev.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default App;
