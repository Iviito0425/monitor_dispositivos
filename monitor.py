import asyncio
import aiosqlite
from ping3 import ping
from datetime import datetime

DB_PATH = "dispositivos.db"

async def get_devices():
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT id, ip_address FROM devices")
        return await cursor.fetchall()

async def update_status(device_id, is_online):
    async with aiosqlite.connect(DB_PATH) as db:
        from datetime import datetime
        now = datetime.now().isoformat()
        await db.execute(
            "UPDATE devices SET is_online = ?, last_ping = ? WHERE id = ?",
            (is_online, now, device_id)
        )
        await db.commit()

async def ping_all_devices():
    while True:
        devices = await get_devices()
        for device_id, ip in devices:
            try:
                response = ping(ip, timeout=1)
                await update_status(device_id, response is not None)
            except Exception:
                await update_status(device_id, False)
        await asyncio.sleep(30)  # Esperar 30 segundos antes del siguiente barrido

if __name__ == "__main__":
    asyncio.run(ping_all_devices())
