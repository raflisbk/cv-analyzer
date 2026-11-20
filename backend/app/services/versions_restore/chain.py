from app.models.job import Job

MAX_CHAIN_LENGTH = 50


def full_chain(job: Job, jobs_by_id: dict) -> list[Job]:
    chain = [job]
    seen = {job.id}
    current = jobs_by_id.get(job.parent_job_id)
    while current and current.id not in seen:
        seen.add(current.id)
        chain.insert(0, current)
        current = jobs_by_id.get(current.parent_job_id)
    children: dict = {}
    for item in jobs_by_id.values():
        children.setdefault(item.parent_job_id, []).append(item)
    tip = job
    while tip.id in children:
        tip = max(children[tip.id], key=lambda item: item.created_at)
        if tip.id in seen:
            break
        seen.add(tip.id)
        chain.append(tip)
    return chain
