import asyncio
import sys
sys.path.insert(0, 'backend')

from app.core.config import get_settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_db():
    settings = get_settings()
    print(f'Database URL: {settings.database_url}')

    engine = create_async_engine(settings.database_url, echo=False)
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text('SELECT version()'))
            version = result.scalar()
            print(f'✅ PostgreSQL version: {version[:60]}...')

            result = await conn.execute(text("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'"))
            table_count = result.scalar()
            print(f'✅ Tables found: {table_count}')

            # Check specific tables
            for table in ['jobs', 'job_roles', 'knowledge_chunks']:
                result = await conn.execute(text(f"SELECT COUNT(*) FROM information_schema.tables WHERE table_name='{table}'"))
                exists = result.scalar() > 0
                status = '✅' if exists else '❌'
                print(f'{status} Table {table}: {"exists" if exists else "missing"}')

        await engine.dispose()
        print('\n✅ Database connection successful!')
        return True
    except Exception as e:
        print(f'\n❌ Database connection failed: {e}')
        return False

if __name__ == '__main__':
    success = asyncio.run(test_db())
    sys.exit(0 if success else 1)
