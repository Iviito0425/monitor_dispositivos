from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import aiosqlite
import csv
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "dispositivos.db"

@app.on_event("startup")
async def startup():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                ip_address TEXT,
                mac_address TEXT,
                is_online BOOLEAN,
                last_ping TEXT,
                location TEXT,
                device_type TEXT,
                notes TEXT
            )
        """)
        await db.commit()

@app.get("/devices")
async def get_devices():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM devices")
        rows = await cursor.fetchall()
        return [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

@app.post("/devices")
async def add_device(device: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO devices (name, ip_address, mac_address, is_online, last_ping, location, device_type, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            device["name"], device["ip_address"], device.get("mac_address"),
            device.get("is_online", False), device.get("last_ping"),
            device.get("location"), device.get("device_type"), device.get("notes")
        ))
        await db.commit()
        return {"status": "added"}

@app.put("/devices/{device_id}")
async def update_device(device_id: int, device: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            UPDATE devices SET
                name = ?, ip_address = ?, mac_address = ?, is_online = ?, last_ping = ?,
                location = ?, device_type = ?, notes = ?
            WHERE id = ?
        """, (
            device["name"], device["ip_address"], device.get("mac_address"),
            device.get("is_online", False), device.get("last_ping"),
            device.get("location"), device.get("device_type"), device.get("notes"),
            device_id
        ))
        await db.commit()
        return {"status": "updated"}

@app.delete("/devices/{device_id}")
async def delete_device(device_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM devices WHERE id = ?", (device_id,))
        await db.commit()

@app.get("/locations")
async def get_locations():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT DISTINCT location FROM devices WHERE location IS NOT NULL AND location != ''")
        rows = await cursor.fetchall()
        return [row[0] for row in rows]

# Función auxiliar para generar respuesta CSV
def build_csv_response(rows):
    output = io.StringIO()
    writer = csv.writer(output)
    if rows:
        writer.writerow(rows[0].keys())  # encabezados
        for row in rows:
            writer.writerow(row.values())
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=dispositivos.csv"})

@app.get("/export/all")
async def export_all():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM devices")
        rows = await cursor.fetchall()
        devices = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
        return build_csv_response(devices)

@app.get("/export/online")
async def export_online():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM devices WHERE is_online = 1")
        rows = await cursor.fetchall()
        devices = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
        return build_csv_response(devices)

@app.get("/export/offline")
async def export_offline():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM devices WHERE is_online = 0")
        rows = await cursor.fetchall()
        devices = [dict(zip([column[0] for column in cursor.description], row)) for row in rows]
        return build_csv_response(devices)
