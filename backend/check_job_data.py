"""Quick script to check job suggestions and anchors"""
import asyncio
import sys
from app.db.session import async_session_maker
from app.models.job import Job
from sqlalchemy import select


async def check_job():
    async with async_session_maker() as session:
        result = await session.execute(
            select(Job).where(Job.id == "aedc49e6-85d9-46d8-a3f2-9356c7a6d1ac")
        )
        job = result.scalar_one_or_none()

        if not job:
            print("Job not found")
            return

        print(f"=== Job: {job.id} ===")
        print(f"Status: {job.status}")

        suggestions = job.suggestions or []
        anchors = job.suggestion_anchors or []

        print(f"\nSuggestions: {len(suggestions)} cards")
        total_items = 0
        items_with_original_text = 0

        for i, card in enumerate(suggestions):
            card_suggestions = card.get("suggestions", [])
            total_items += len(card_suggestions)
            print(f"\n  Card {i+1}: {card.get('section')} ({len(card_suggestions)} items)")

            for j, item in enumerate(card_suggestions[:3]):  # Show first 3
                has_orig = "Y" if item.get("original_text") else "N"
                if item.get("original_text"):
                    items_with_original_text += 1
                print(f"    [{j}] {has_orig} {item.get('text', '')[:50]}...")
                if item.get("original_text"):
                    print(f"        original: {item.get('original_text')[:50]}...")

        print(f"\n  Total suggestion items: {total_items}")
        print(f"  Items with original_text: {items_with_original_text}")

        print(f"\nAnchors: {len(anchors)}")
        for i, anchor in enumerate(anchors):
            print(f"  [{i+1}] {anchor.get('suggestion_id')} on page {anchor.get('page_index')}")
            print(f"      text: {anchor.get('text_anchor', '')[:50]}...")

        print(f"\n=== Summary ===")
        print(f"Total suggestion items: {total_items}")
        print(f"Items with original_text: {items_with_original_text}")
        print(f"Items without original_text: {total_items - items_with_original_text}")
        print(f"Anchors created: {len(anchors)}")
        print(f"Coverage: {len(anchors)}/{total_items} = {100*len(anchors)/total_items if total_items > 0 else 0:.1f}%")


if __name__ == "__main__":
    asyncio.run(check_job(), loop_factory=asyncio.SelectorEventLoop)
