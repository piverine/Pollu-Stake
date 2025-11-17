import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import asyncio
import asyncpg
import datetime
import os
from dotenv import load_dotenv

# Import our custom modules
from iot_simulator import SensorSimulator
from ai_forecaster import LSTMForecaster

# --- 1. Configuration ---
load_dotenv()  # Load .env file
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in .env file")

FORECAST_ALERT_THRESHOLD = 150.0  # "Warning" level
ACTUAL_PENALTY_THRESHOLD = 200.0  # "Lenient" penalty level
MONITORING_INTERVAL_SECONDS = 3   # How often to check (in seconds)
SLASH_AMOUNT = 10.0               # Amount to slash per breach
MAX_HISTORY_LENGTH = 50           # How many readings to send to frontend

# --- 2. App & Middleware Setup ---
app = FastAPI()

print("!!! USING NEW CORS SETTINGS - v2 !!!")

# The new, correct block
origins = [
    "http://localhost:3000",  # The frontend dev server
    "http://127.0.0.1:3000", # Just in case the browser uses the IP
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Use the specific list
    allow_credentials=True,  # This is now safe and correct
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- 3. In-Memory Simulators & AI Model ---
simulators = {
    "Bhilai-001": SensorSimulator(base_level=80, spike_chance=0.05, max_level=220),
    "Mumbai-002": SensorSimulator(base_level=60, spike_chance=0.02, max_level=220),
}

forecaster = LSTMForecaster(
    model_path="lstm_model.keras",
    scaler_path="scaler.joblib",
    breach_threshold=FORECAST_ALERT_THRESHOLD
)

# --- 4. Database Connection Pool ---
app.state.pool = None

@app.on_event("startup")
async def startup_event():
    """
    On server startup:
    1. Create the database connection pool.
    2. Ensure mock data (factories, state) exists.
    3. Launch the autonomous monitoring background task.
    """
    try:
        print("Connecting to database...")
        app.state.pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=1,
            max_size=10
        )
        
        # --- MOVED INITIALIZATION LOGIC HERE ---
        print("Ensuring initial data exists in database...")
        async with app.state.pool.acquire() as conn:
            # Use INSERT ... ON CONFLICT to safely initialize.
            
            print("Ensuring protocol state exists (ID: 1)...")
            await conn.execute(
                "INSERT INTO protocol_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING"
            )

            print("Ensuring mock factories exist...")
            await conn.execute(
                """
                INSERT INTO factories (id, name, stake_balance, status) VALUES
                ('factory-001', 'Bhilai Steel Plant', 100.0, 'NORMAL'),
                ('factory-002', 'Durg Cement Works', 75.0, 'NORMAL')
                ON CONFLICT (id) DO NOTHING; 
                """
                # ON CONFLICT (id) DO NOTHING ensures that if 'factory-001'
                # already exists, this command just skips it without erroring.
            )
        print("Database initialization check complete.")
        # --- END MOVED LOGIC ---
        
        print("Database connection pool created successfully.")
        
        # Start the background task, passing the pool
        asyncio.create_task(autonomous_monitor(app.state.pool))
        
    except asyncpg.exceptions.UndefinedTableError:
         print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
         print("CRITICAL ERROR: Tables not found.")
         print("You must run the 8-table schema SQL in your NeonDB editor first.")
         print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    except Exception as e:
        print(f"CRITICAL: Failed to connect or initialize database. {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """
    On server shutdown, close the database connection pool.
    """
    if app.state.pool:
        print("Closing database connection pool.")
        await app.state.pool.close()

# --- 5. Background Monitoring Task ---
async def autonomous_monitor(pool: asyncpg.Pool):
    """
    This function runs in the background, using the DB pool.
    """
    await asyncio.sleep(1) # Give server a moment to start
    print("Starting autonomous monitoring cycle...")
    
    while True:
        try:
            async with pool.acquire() as conn:
                for factory_id in simulators:
                    
                    # 1. Get new simulated data
                    new_reading = simulators[factory_id].get_next_reading()
                    current_pm2_5 = new_reading["pm2_5"]
                    
                    # 2. Add to history in DB
                    await conn.execute(
                        """
                        INSERT INTO sensor_readings (factory_id, pm2_5, so2, nox)
                        VALUES ($1, $2, $3, $4)
                        """,
                        factory_id, new_reading["pm2_5"], new_reading["so2"], new_reading["nox"]
                    )
                    
                    # 3. Get recent history from DB for AI
                    history_rows = await conn.fetch(
                        """
                        SELECT pm2_5 FROM sensor_readings
                        WHERE factory_id = $1
                        ORDER BY timestamp DESC
                        LIMIT $2
                        """,
                        factory_id, forecaster.look_back
                    )
                    
                    pm2_5_history = [row['pm2_5'] for row in history_rows]
                    pm2_5_history.reverse() # Needs to be in chronological order
                    
                    # 4. --- Check Tiers (Penalty > Alert) ---
                    
                    # TIER 2: PENALTY CHECK (Actual Breach)
                    if current_pm2_5 > ACTUAL_PENALTY_THRESHOLD:
                        print(f"!!! PENALTY: {factory_id} is breaching NOW ({current_pm2_5})")
                        
                        # Use a transaction for the slash
                        async with conn.transaction():
                            # Set status to PENALTY
                            await conn.execute("UPDATE factories SET status = 'PENALTY' WHERE id = $1", factory_id)
                            
                            # Get current stake
                            factory_row = await conn.fetchrow("SELECT stake_balance FROM factories WHERE id = $1 FOR UPDATE", factory_id)
                            current_stake = factory_row['stake_balance'] if factory_row else 0
                            
                            # Perform the "Slash"
                            actual_slash = min(current_stake, SLASH_AMOUNT)
                            new_stake = current_stake - actual_slash
                            
                            await conn.execute("UPDATE factories SET stake_balance = $1 WHERE id = $2", new_stake, factory_id)
                            await conn.execute("UPDATE protocol_state SET admin_fund_balance = admin_fund_balance + $1 WHERE id = 1", actual_slash)
                            
                            # Log the slash event (critical step)
                            await conn.execute(
                                """
                                INSERT INTO slash_events (factory_id, amount, reason, triggered_by, tx_hash)
                                VALUES ($1, $2, $3, 'ORACLE', $4)
                                """,
                                factory_id, actual_slash, f"Actual PM2.5 breach: {current_pm2_5}", f"mock_tx_{asyncio.get_event_loop().time()}"
                            )
                    
                    # TIER 1: FORECAST CHECK (Predicted Breach)
                    else:
                        if len(pm2_5_history) < forecaster.look_back:
                            await conn.execute("UPDATE factories SET status = 'NORMAL' WHERE id = $1", factory_id)
                        else:
                            breach_predicted, predicted_val = forecaster.predict_breach(pm2_5_history)
                            
                            # Log the forecast
                            await conn.execute(
                                """
                                INSERT INTO forecast_logs (factory_id, predicted_value, breach_predicted)
                                VALUES ($1, $2, $3)
                                """,
                                factory_id, predicted_val, bool(breach_predicted)
                            )
                            
                            if breach_predicted:
                                print(f"!!! ALERT: {factory_id} predicted to breach ({predicted_val})")
                                await conn.execute("UPDATE factories SET status = 'ALERT' WHERE id = $1", factory_id)
                            else:
                                await conn.execute("UPDATE factories SET status = 'NORMAL' WHERE id = $1", factory_id)
                                
        except Exception as e:
            print(f"Error in monitoring loop: {e}")
            # Don't crash the loop, just log and wait
        
        await asyncio.sleep(MONITORING_INTERVAL_SECONDS)

# --- 6. API Endpoints ---

@app.get("/api/dashboard-data")
async def get_dashboard_data():
    """
    Provides all data needed to populate the dashboard.
    This replaces the old 'return db'
    """
    if not app.state.pool:
        raise HTTPException(status_code=503, detail="Database not connected")

    async with app.state.pool.acquire() as conn:
        # 1. Get all factory data and format as list of dicts
        # --- UPDATED QUERY ---
        factory_rows = await conn.fetch(
            """
            SELECT id, name, stake_balance, license_nft_id, 
                   compliance_score, status, risk_level 
            FROM factories
            """
        )
        # We'll also add risk_level and compliance_score to your schema later, 
        # for now, let's mock them if they don't exist.
        
        factories_list = []
        for row in factory_rows:
            factories_list.append({
                "id": row['id'],
                "name": row['name'],
                "stakeBalance": float(row['stake_balance']), # Match frontend type
                "status": row['status'],
                # Mocking data that's in frontend but not DB yet
                "licenseNftId": row.get('license_nft_id', 'N/A'),
                "complianceScore": row.get('compliance_score', 80),
                "riskLevel": row.get('risk_level', 'low'),
                # Add other fields as needed by your frontend 'Factory' type
                "address": "0x...", # Mock
                "location": {"city": "Unknown"}, # Mock
                "lastForecast": None # Mock
            })
        # --- END UPDATED QUERY/LOGIC ---

        # 2. Get the admin fund
        protocol_state = await conn.fetchrow("SELECT admin_fund_balance FROM protocol_state WHERE id = 1")
        admin_fund = float(protocol_state['admin_fund_balance']) if protocol_state else 0.0
        
        # 3. Get sensor history (this part is fine)
        history_rows = await conn.fetch(
            f"""
            WITH ranked_readings AS (
                SELECT
                    factory_id, pm2_5, so2, nox, timestamp,
                    ROW_NUMBER() OVER(PARTITION BY factory_id ORDER BY timestamp DESC) as rn
                FROM sensor_readings
            )
            SELECT factory_id, pm2_5, so2, nox, timestamp
            FROM ranked_readings
            WHERE rn <= $1
            ORDER BY factory_id, timestamp ASC;
            """,
            MAX_HISTORY_LENGTH
        )
        
        sensor_history_dict = {row['id']: [] for row in factories_list}
        for row in history_rows:
            if row['factory_id'] in sensor_history_dict:
                sensor_history_dict[row['factory_id']].append({
                    "pm2_5": float(row['pm2_5']),
                    "so2": float(row['so2']) if row['so2'] is not None else 0.0,
                    "nox": float(row['nox']) if row['nox'] is not None else 0.0,
                    "timestamp": row['timestamp'].isoformat()
                })

        # 4. Assemble the final dashboard object
        dashboard_data = {
            # Note: We send a list, the store will convert it to an object
            "factories": factories_list, 
            "admin_fund": admin_fund,
            "sensor_history": sensor_history_dict,
            "max_history_length": MAX_HISTORY_LENGTH
        }
        
        return dashboard_data
    
# --- ADD THIS NEW ENDPOINT ---
@app.get("/api/forecast/{factory_id}")
async def get_forecast_by_id(factory_id: str):
    """
    Provides forecast data for a *single* factory.
    This is what the frontend's aiApiClient.ts is looking for.
    """
    if not app.state.pool:
        raise HTTPException(status_code=503, detail="Database not connected")

    async with app.state.pool.acquire() as conn:
        # Get the latest forecast log for this factory
        forecast_row = await conn.fetchrow(
            """
            SELECT predicted_value, breach_predicted, timestamp
            FROM forecast_logs
            WHERE factory_id = $1
            ORDER BY timestamp DESC
            LIMIT 1
            """,
            factory_id
        )

        if not forecast_row:
            raise HTTPException(status_code=404, detail="No forecast data found for this factory.")

        # The frontend also expects a "confidence" score, which our DB doesn't store.
        # We will hard-code it for now to match the frontend's expectation.
        return {
            "factory_id": factory_id,
            "forecast_breach": forecast_row['breach_predicted'],
            "confidence": 0.95,  # Mocking this as the frontend needs it
            "predicted_aqi": float(forecast_row['predicted_value']),
            "timestamp": forecast_row['timestamp'].isoformat(),
            "next_check": (forecast_row['timestamp'] + datetime.timedelta(seconds=10)).isoformat()
        }

# --- 7. Run the Server ---
if __name__ == "__main__":
    # This block is now *only* for running the server directly
    # All setup logic has been moved to startup_event
    print("Starting Uvicorn server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)