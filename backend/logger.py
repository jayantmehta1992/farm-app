import json
import logging
import sys
from datetime import datetime, timezone


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "ts":    datetime.now(timezone.utc).isoformat(),
            "level": record.levelname.lower(),
            "msg":   record.getMessage(),
        }
        entry.update(getattr(record, "_fields", {}))
        if record.exc_info:
            entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(entry)


class StructuredLogger:
    """Thin wrapper that emits JSON log lines via stdlib logging."""

    def __init__(self, name: str = "farm_app") -> None:
        self._log = logging.getLogger(name)
        if not self._log.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(_JsonFormatter())
            self._log.addHandler(handler)
            self._log.setLevel(logging.INFO)
            self._log.propagate = False

    def _emit(self, level: int, msg: str, **fields) -> None:
        if self._log.isEnabledFor(level):
            self._log.log(level, msg, extra={"_fields": fields})

    def info(self, msg: str, **fields) -> None:
        self._emit(logging.INFO, msg, **fields)

    def warning(self, msg: str, **fields) -> None:
        self._emit(logging.WARNING, msg, **fields)

    def error(self, msg: str, **fields) -> None:
        self._emit(logging.ERROR, msg, **fields)


log = StructuredLogger()
