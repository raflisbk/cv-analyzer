import asyncio
from app.core.config import get_settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    settings = get_settings()
    print(f'DB Host: {settings.CV_ANALYZER_DB_HOST}:{settings.CV_ANALYZER_DB_PORT}')
    print(f'DB Name: {settings.CV_ANALYZER_DB_NAME}')

    engine = create_async_engine(settings.database_url, echo=False)
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text('SELECT version()'))
            version = result.scalar()
            print(f'✅ Connected! PostgreSQL: {version[:50]}...')
    except Exception as e:
        print(f'❌ Connection failed: {e}')
    finally:
        await engine.dispose()

asyncio.run(main())
