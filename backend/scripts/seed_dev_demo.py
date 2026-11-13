import argparse
import asyncio
import os
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from app.models.job import Job
from app.models.user import User
from scripts.seed_demo.builders import build_jobs, seed_prefix

LOCAL_HOSTS = {"localhost", "postgres", "127.0.0.1"}


def ensure_dev_environment(environment: str | None, host: str | None) -> None:
    if environment != "development" or host not in LOCAL_HOSTS:
        raise RuntimeError(
            "Dev demo seed requires development and a local database host"
        )


def conversation_data(
    user_id: uuid.UUID, email: str, job_id: uuid.UUID
) -> list[Conversation]:
    prefix = seed_prefix(email)
    return [
        Conversation(
            id=uuid.uuid5(
                uuid.NAMESPACE_URL,
                f"cv-analyzer-dev-demo:{prefix}:conversation:{scope}",
            ),
            user_id=user_id,
            job_id=job_id if scope == "cv" else None,
            title="Improve Mira's CV" if scope == "cv" else "Career planning",
        )
        for scope in ("general", "cv")
    ]


def message_data(conversations: list[Conversation]) -> list[ConversationMessage]:
    texts = (
        (
            "How can I prepare for interviews?",
            "Start with two examples of your reporting work.",
            "I will practice those examples.",
        ),
        (
            "What is the main weakness in this CV?",
            "The impact bullets need measured outcomes from your own work.",
            "I will add the numbers I can verify.",
        ),
    )
    return [
        ConversationMessage(
            id=uuid.uuid5(conversation.id, str(index)),
            conversation_id=conversation.id,
            role="assistant" if index == 1 else "user",
            text=text,
            actions=[],
        )
        for conversation, messages in zip(conversations, texts, strict=True)
        for index, text in enumerate(messages)
    ]


async def _get_or_create_user(session: AsyncSession, email: str) -> User:
    user = (
        await session.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if user is None:
        user = User(
            id=uuid.uuid4(),
            email=email,
            google_id=f"dev-seed-{seed_prefix(email)}",
            name="Dev Demo User",
        )
        session.add(user)
    return user


async def _add_missing(session: AsyncSession, statement, objects: list) -> None:
    existing = set((await session.execute(statement)).scalars().all())
    for obj in objects:
        if obj.id not in existing:
            session.add(obj)


async def _sync_jobs(
    session: AsyncSession, user_id: uuid.UUID, jobs: list[Job]
) -> None:
    existing = {
        job.id: job
        for job in (await session.execute(select(Job).where(Job.user_id == user_id)))
        .scalars()
        .all()
    }
    for job in jobs:
        current = existing.get(job.id)
        if current is None:
            session.add(job)
        elif (current.file_metadata or {}).get("seed_key") == job.file_metadata[
            "seed_key"
        ]:
            for field in ("result", "nlp_result", "suggestions", "cv_document"):
                setattr(current, field, getattr(job, field))


async def seed(session: AsyncSession, email: str) -> list[Job]:
    email = email.strip().lower()
    if not email or "@" not in email or len(email) > 255:
        raise ValueError("Provide a valid email with --email")
    user = await _get_or_create_user(session, email)
    jobs = build_jobs(user.id, email)
    await _sync_jobs(session, user.id, jobs)
    conversations = conversation_data(user.id, email, jobs[-2].id)
    await _add_missing(
        session,
        select(Conversation.id).where(Conversation.user_id == user.id),
        conversations,
    )
    messages = message_data(conversations)
    await _add_missing(
        session,
        select(ConversationMessage.id).where(
            ConversationMessage.conversation_id.in_([c.id for c in conversations])
        ),
        messages,
    )
    await session.commit()
    return jobs


async def run(email: str) -> None:
    ensure_dev_environment(
        os.environ.get("CV_ANALYZER_ENV"), os.environ.get("CV_ANALYZER_DB_HOST")
    )
    from app.core.config import get_settings
    from app.db.session import async_session_maker

    settings = get_settings()
    ensure_dev_environment(settings.CV_ANALYZER_ENV, settings.CV_ANALYZER_DB_HOST)
    async with async_session_maker() as session:
        jobs = await seed(session, email)
    for job in jobs:
        print(f"{job.file_metadata['seed_key']}: {job.id} /app/cvs/{job.id}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed synthetic CV data in a local development database"
    )
    parser.add_argument("--email", required=True)
    args = parser.parse_args()
    asyncio.run(run(args.email))


if __name__ == "__main__":
    main()
