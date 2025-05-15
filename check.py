import os, pathlib, dotenv
dotenv.load_dotenv(pathlib.Path(".env"))
os.getenv("TG_TOKEN")