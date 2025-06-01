from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import aiosqlite
import csv
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Para permitir cualquier origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "dispositivos.db"

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
            INSERT INTO devices (name, ip_address, is_online, last_ping, location, device_type, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            device["name"], device["ip_address"], device.get("is_online", False),
            device.get("last_ping"), device.get("location"), device.get("device_type"), device.get("notes")
        ))
        await db.commit()
        return {"status": "added"}

@app.put("/devices/{device_id}")
async def update_device(device_id: int, device: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            UPDATE devices SET
                name = ?, ip_address = ?, is_online = ?, last_ping = ?,
                location = ?, device_type = ?, notes = ?
            WHERE id = ?
        """, (
            device["name"], device["ip_address"], device.get("is_online", False),
            device.get("last_ping"), device.get("location"), device.get("device_type"), device.get("notes"), device_id
        ))
        await db.commit()
        return {"status": "updated"}

@app.delete("/devices/{device_id}")
async def delete_device(device_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM devices WHERE id = ?", (device_id,))
        await db.commit()
        return {"status": "deleted"}

@app.get("/export")
async def export_csv():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT * FROM devices")
        rows = await cursor.fetchall()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([column[0] for column in cursor.description])
        writer.writerows(rows)
        output.seek(0)
        return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=devices.csv"})
