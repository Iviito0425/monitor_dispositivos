# Monitor de Dispositivos en Red Local

Sistema de monitorización local que detecta y registra dispositivos en red, actualiza su estado mediante `ping`, y permite gestionar toda la información desde una interfaz web.

## 📦 Estructura del proyecto

monitor_dispositivos/
├── main.py # Backend FastAPI
├── monitor.py # Script de ping automático
├── dispositivos.db # Base de datos SQLite
├── venv/ # Entorno virtual Python
├── frontend/ # Frontend React + Tailwind
│ ├── src/
│ │ ├── App.jsx
│ │ ├── DeviceForm.jsx
│ │ └── ...
│ ├── deploy_build.sh # Script de compilación y despliegue
│ └── ...
└── systemd/
├── backend.service
└── monitor.service


## 🚀 Funcionalidades

- Registro de dispositivos: nombre, IP, MAC, tipo, ubicación, notas.
- Ping automático cada minuto para comprobar si están conectados.
- Exportación CSV:
  - Todos los dispositivos
  - Solo los conectados
  - Solo los desconectados
- Interfaz responsive: búsqueda, agrupación por ubicación, eliminación, edición.

## 🖥️ Requisitos

- Python 3.11+
- Node.js 18+
- SQLite
- FastAPI + aiosqlite
- React + Tailwind CSS

## ⚙️ Instalación

### Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install fastapi aiosqlite uvicorn


### Frontend

cd frontend
npm install

### Compilar y desplegar el frontend

cd frontend
./deploy_build.sh


### Automatización con systemd
El proyecto se ejecuta automáticamente al iniciar la Raspberry Pi:

backend.service: lanza el backend FastAPI en el puerto 8000

monitor.service: ejecuta el script monitor.py que realiza pings a cada IP

Ambos servicios se reinician automáticamente desde deploy_build.sh tras cada despliegue.

### Endpoints disponibles
GET /devices — Obtener todos los dispositivos

POST /devices — Añadir dispositivo

PUT /devices/{id} — Actualizar dispositivo

DELETE /devices/{id} — Eliminar dispositivo

GET /locations — Obtener ubicaciones únicas

GET /export/all — CSV con todos los dispositivos

GET /export/online — CSV con conectados

GET /export/offline — CSV con desconectados


### Seguridad
Todos los dispositivos deben tener configurado manualmente el DNS si se desea usar un bloqueador como Pi-hole.

El backend solo está disponible localmente (192.168.1.11:8000).


### Autor
Proyecto personal desarrollado por @Iviito0425 para aprender FastAPI, React y automatización en Raspberry Pi.
