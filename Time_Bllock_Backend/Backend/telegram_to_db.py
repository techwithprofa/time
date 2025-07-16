import os
import logging
from datetime import datetime
import psycopg2
# import time # Optional: for more advanced retry logic

from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters

# Load environment variables from .env
load_dotenv()

# Retrieve Telegram Bot Token
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# PostgreSQL Connection Details
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Set up basic logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

def get_db_connection():
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        logger.info("Successfully connected to PostgreSQL database.")
        return conn
    except psycopg2.OperationalError as e:
        logger.error(f"Error connecting to PostgreSQL: {e}")
        # Basic retry logic (optional, can be expanded)
        # For a Docker Compose setup, the app might start before the DB is ready.
        # A simple retry loop or an entrypoint script with wait-for-it.sh is more robust.
        # For now, we'll just log and return None, relying on Docker Compose's depends_on.
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred while connecting to PostgreSQL: {e}")
        return None

def init_db(conn):
    if not conn:
        logger.error("Database connection not available for DB initialization.")
        return
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id SERIAL PRIMARY KEY,
                    log_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    message_timestamp TIMESTAMPTZ NOT NULL,
                    message_text TEXT NOT NULL
                );
            """)
            conn.commit()
            logger.info("Table 'conversations' initialized successfully (created if not exists).")
    except Exception as e:
        logger.error(f"Error initializing database table: {e}")
        if conn: # Attempt to rollback if connection exists
            try:
                conn.rollback()
            except Exception as rb_e:
                logger.error(f"Error during rollback: {rb_e}")

def save_message_to_db(conn, message_ts_utc, text):
    if not conn:
        logger.error("Database connection not available. Cannot save message.")
        return
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO conversations (message_timestamp, message_text) VALUES (%s, %s)",
                (message_ts_utc, text)
            )
            conn.commit()
            logger.info(f"Message saved to database: {text[:50]}...") # Log snippet
    except Exception as e:
        logger.error(f"Error saving message to database: {e}")
        if conn:
            try:
                conn.rollback()
            except Exception as rb_e:
                logger.error(f"Error during rollback: {rb_e}")

async def message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles incoming text messages and logs them to the database."""
    db_conn = context.bot_data.get('db_conn')
    if not db_conn:
        logger.error("Database connection not found in bot_data. Cannot log message.")
        return

    if update.message and update.message.text: # Ensure there's a message and text
        message_text = update.message.text
        message_datetime_utc = update.message.date # This is already a datetime object in UTC

        logger.info(f"Received message at {message_datetime_utc}: {message_text}")
        
        # Print basic info to console (can be simplified or removed)
        print(f"Message: {message_text}")
        print(f"Received at: {message_datetime_utc.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print("---")

        save_message_to_db(db_conn, message_datetime_utc, message_text)
        
        # Example reply (optional)
        # await update.message.reply_text(f"Message logged to DB.")
    elif update.message:
        logger.info(f"Received non-text message from user {update.message.from_user.id if update.message.from_user else 'UnknownUser'}")


def main() -> None:
    """Starts the Telegram bot."""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not found in environment variables. Bot cannot start.")
        return

    db_conn = get_db_connection()

    if db_conn:
        init_db(db_conn)
        logger.info("Database initialized (if needed).")
    else:
        logger.critical("Failed to connect to the database. Bot starting without DB functionality.")
        # Depending on requirements, you might want to exit if DB is critical.
        # For now, it will run but log errors when trying to save messages.

    # Create an ApplicationBuilder instance
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

    # Store db_conn in application.bot_data for access in handlers
    # It might be None if connection failed, handlers should check
    application.bot_data['db_conn'] = db_conn

    # Get the dispatcher and register the message_handler for text messages
    message_handler_instance = MessageHandler(
        filters.TEXT & (~filters.COMMAND),
        message_handler
    )
    application.add_handler(message_handler_instance)

    logger.info("Bot started and listening for messages...")
    # Start the bot
    application.run_polling()

    # Close the database connection when the application is shutting down
    # This part might not be reached if run_polling() blocks indefinitely and is terminated externally.
    # For robust cleanup, signal handling (e.g., for SIGINT, SIGTERM) might be needed.
    if db_conn:
        try:
            db_conn.close()
            logger.info("Database connection closed.")
        except Exception as e:
            logger.error(f"Error closing database connection: {e}")


if __name__ == "__main__":
    main()
