import asyncio
from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.job import Job

async def check():
    async with async_session_maker() as db:
        result = await db.execute(select(Job).where(Job.id == '130a3e9b-58cd-4106-97c6-a9f24c491219'))
        job = result.scalar_one_or_none()
        if job:
            print(f'Job status: {job.status}')
            print(f'Suggestion cards: {len(job.suggestion_cards) if job.suggestion_cards else 0}')
            print(f'Suggestion anchors: {len(job.suggestion_anchors) if job.suggestion_anchors else 0}')
            if job.suggestion_anchors:
                print('\n=== First 3 anchors ===')
                for i, a in enumerate(job.suggestion_anchors[:3]):
                    print(f'Anchor {i+1}:')
                    print(f'  suggestion_id: {a.get("suggestion_id")}')
                    print(f'  page_index: {a.get("page_index")}')
                    print(f'  text_anchor: "{a.get("text_anchor")[:80]}..."')
                    print(f'  bbox: {a.get("bbox")}')
                    print(f'  priority: {a.get("priority")}')
                    print()
            else:
                print('No anchors found!')
        else:
            print('Job not found')

if __name__ == '__main__':
    asyncio.run(check())
