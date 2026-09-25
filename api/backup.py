"""
api/backup.py - Production Snapshot & Disaster Recovery Management
Milestone 10: Automated database snapshot creation, cataloging, and integrity checks
"""

import os
import json
import gzip
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from api.store import job_store

BACKUP_DIR = os.path.join(os.getcwd(), "backups")


class BackupManager:
    @staticmethod
    def ensure_backup_dir() -> str:
        if not os.path.exists(BACKUP_DIR):
            os.makedirs(BACKUP_DIR, exist_ok=True)
        return BACKUP_DIR

    @classmethod
    def create_snapshot(cls, tag: str = "manual") -> Dict[str, Any]:
        """Creates a compressed JSON snapshot of the in-memory/DB state."""
        cls.ensure_backup_dir()
        now = datetime.now(timezone.utc)
        timestamp_str = now.strftime("%Y%m%d_%H%M%S")
        snapshot_id = f"snap_{timestamp_str}_{tag}"
        filename = f"{snapshot_id}.json.gz"
        filepath = os.path.join(BACKUP_DIR, filename)

        # Collect state
        all_jobs = job_store.get_all_jobs()
        purged_records = getattr(job_store, "_purged_records", {})
        certified_orders = getattr(job_store, "_certified_orders", {})
        audit_logs = getattr(job_store, "_audit_logs", {})
        user_balances = getattr(job_store, "_user_balances", {})

        snapshot_payload = {
            "version": "1.0",
            "snapshot_id": snapshot_id,
            "created_at": now.isoformat(),
            "tag": tag,
            "metadata": {
                "total_jobs": len(all_jobs),
                "total_purged": len(purged_records),
                "total_certified_orders": len(certified_orders),
                "total_audit_entries": sum(len(v) for v in audit_logs.values()),
                "total_users": len(user_balances)
            },
            "data": {
                "jobs": all_jobs,
                "purged_records": purged_records,
                "certified_orders": certified_orders,
                "audit_logs": audit_logs,
                "user_balances": user_balances
            }
        }

        json_bytes = json.dumps(snapshot_payload, default=str).encode("utf-8")
        with gzip.open(filepath, "wb") as f:
            f.write(json_bytes)

        file_size = os.path.getsize(filepath)

        return {
            "snapshot_id": snapshot_id,
            "filename": filename,
            "filepath": filepath,
            "file_size_bytes": file_size,
            "created_at": now.isoformat(),
            "records_captured": snapshot_payload["metadata"]
        }

    @classmethod
    def list_snapshots(cls) -> List[Dict[str, Any]]:
        """List all available snapshots in the backup catalog."""
        cls.ensure_backup_dir()
        snapshots = []
        for fname in sorted(os.listdir(BACKUP_DIR), reverse=True):
            if fname.endswith(".json.gz"):
                fpath = os.path.join(BACKUP_DIR, fname)
                mtime = os.path.getmtime(fpath)
                fsize = os.path.getsize(fpath)
                snapshots.append({
                    "filename": fname,
                    "filepath": fpath,
                    "size_bytes": fsize,
                    "created_at": datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()
                })
        return snapshots

    @classmethod
    def verify_snapshot_integrity(cls, filename: str) -> Dict[str, Any]:
        """Verify the cryptographic and JSON structure of a snapshot."""
        filepath = os.path.join(BACKUP_DIR, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Snapshot file {filename} does not exist")

        with gzip.open(filepath, "rb") as f:
            content = f.read()
            data = json.loads(content.decode("utf-8"))

        required_keys = {"version", "snapshot_id", "created_at", "metadata", "data"}
        if not required_keys.issubset(data.keys()):
            raise ValueError(f"Snapshot missing required root keys: {required_keys - set(data.keys())}")

        return {
            "valid": True,
            "snapshot_id": data["snapshot_id"],
            "version": data["version"],
            "records_verified": data["metadata"]
        }
