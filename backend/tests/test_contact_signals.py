import time

import pytest

from app.services.contact_signals import has_phone_number


@pytest.mark.parametrize(
    "text",
    [
        "john@test.com +628123456789 linkedin.com/in/johndoe",
        "Phone: +62 812-3456-7890",
        "WA 0812 3456 7890",
        "Tel (021) 555-0100",
        "john.doe@email.com | +1-555-0100",
    ],
)
def test_detects_real_phone_numbers(text):
    assert has_phone_number(text) is True


@pytest.mark.parametrize(
    "text",
    [
        "Backend Engineer, PT Contoh - Jan 2022 - Present",
        "CV Maju Jaya - 2020 - 2021",
        "S1 Teknik Informatika, Universitas Indonesia, 2016 - 2020",
        "Worked 2018 - 2020 and 2021 - 2022",
        "Salary expectation Rp 12.500.000",
        "Reduced p95 latency by 35% across 2M events",
        "",
    ],
)
def test_ignores_dates_and_amounts(text):
    assert has_phone_number(text) is False


@pytest.mark.parametrize(
    "text",
    [
        "2020" + " " * 200_000 + "20219 ",
        "1 " * 200_000 + "a",
        "+" + "1" * 200_000 + "x",
        "(" * 100_000 + "12345678",
    ],
)
def test_hostile_input_is_scanned_in_linear_time(text):
    started = time.perf_counter()
    has_phone_number(text)

    assert time.perf_counter() - started < 1.0
