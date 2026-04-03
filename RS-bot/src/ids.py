"""
Normalize worker/job IDs from CSV (ints), MongoDB (24-char hex strings), or mixed sources.
"""
from __future__ import annotations

from typing import Union

import pandas as pd


def normalize_entity_id(value) -> Union[int, str]:
    """
    Return int for numeric ids, str for Mongo ObjectIds and other non-numeric strings.
    Matches safely against DataFrames that may store ids as int or str.
    """
    if value is None or (isinstance(value, float) and pd.isna(value)):
        raise ValueError("missing id")
    if isinstance(value, bool):
        raise ValueError("invalid id type: bool")
    # numpy / pandas scalars
    if hasattr(value, "item"):
        try:
            value = value.item()
        except Exception:
            pass
    if isinstance(value, int):
        return value
    if isinstance(value, float) and float(value).is_integer():
        return int(value)
    s = str(value).strip()
    if not s:
        raise ValueError("empty id")
    if s.isdigit():
        return int(s)
    return s
