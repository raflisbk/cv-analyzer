"""Cloudflare R2 storage service."""

import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


settings = get_settings()


class StorageError(Exception):
    """Base exception for storage operations"""


class StorageService:
    """
    Cloudflare R2 storage operations using boto3 S3-compatible client
    """

    def __init__(self):
        self._client = None
        self.bucket = settings.CV_ANALYZER_R2_BUCKET

    @property
    def client(self):
        """Lazy initialization of S3 client to avoid errors when R2 credentials not configured"""
        if self._client is None:
            self._client = boto3.client(
                "s3",
                endpoint_url=settings.CV_ANALYZER_R2_ENDPOINT,
                aws_access_key_id=settings.CV_ANALYZER_R2_ACCESS_KEY,
                aws_secret_access_key=settings.CV_ANALYZER_R2_SECRET_KEY,
                region_name="auto",  # R2 uses 'auto' region
            )
        return self._client

    def upload_file(
        self, content: bytes, original_filename: str, metadata: dict[str, str]
    ) -> str:
        """
        Upload file to R2 with UUID-based naming

        Args:
            content: File content bytes
            original_filename: Original filename
            metadata: File metadata (mime_type, size, etc.)

        Returns:
            file_id: UUID-based file identifier

        Raises:
            Exception: If upload fails
        """
        # Generate UUID-based filename
        file_id = f"{uuid.uuid4()}-{Path(original_filename).name}"

        # Add metadata
        s3_metadata = {
            "original-filename": original_filename,
            "upload-timestamp": datetime.now(UTC).isoformat(),
            "mime-type": metadata.get("mime_type", "application/octet-stream"),
            "size": str(metadata.get("size", len(content))),
            "delete-after": (
                datetime.now(UTC) + timedelta(hours=24)
            ).isoformat(),  # Per D-20
        }

        try:
            # Upload to R2
            self.client.put_object(
                Bucket=self.bucket,
                Key=file_id,
                Body=content,
                Metadata=s3_metadata,
                ContentType=metadata.get("mime_type", "application/octet-stream"),
            )

            logger.info(
                "r2_upload_done",
                file_id=file_id,
                original_filename=original_filename,
                size=len(content),
            )

            return file_id

        except ClientError as e:
            logger.error(
                "r2_upload_failed",
                original_filename=original_filename,
                error=str(e),
                exc_info=True,
            )
            msg = f"Storage upload failed: {e!s}"
            raise StorageError(msg) from e

    def get_file(self, file_id: str) -> bytes:
        """
        Retrieve file content from R2

        Args:
            file_id: UUID-based file identifier

        Returns:
            File content bytes

        Raises:
            Exception: If file not found or retrieval fails
        """
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=file_id)
            return response["Body"].read()

        except ClientError as e:
            logger.error(
                "r2_retrieval_failed", file_id=file_id, error=str(e), exc_info=True
            )
            msg = f"File not found or retrieval failed: {e!s}"
            raise StorageError(msg) from e

    def generate_presigned_url(self, file_id: str, expiration: int = 3600) -> str:
        """
        Generate presigned URL for temporary file access

        Args:
            file_id: UUID-based file identifier
            expiration: URL expiration in seconds (default 1 hour)

        Returns:
            Presigned URL
        """
        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": file_id},
                ExpiresIn=expiration,
            )

            logger.info(
                "presigned_url_generated",
                file_id=file_id,
                expiration=expiration,
            )

            return url

        except ClientError as e:
            logger.error(
                "presigned_url_failed", file_id=file_id, error=str(e), exc_info=True
            )
            msg = f"URL generation failed: {e!s}"
            raise StorageError(msg) from e

    def delete_file(self, file_id: str) -> bool:
        """
        Delete file from R2

        Args:
            file_id: UUID-based file identifier

        Returns:
            True if deleted successfully
        """
        try:
            self.client.delete_object(Bucket=self.bucket, Key=file_id)

            logger.info("r2_delete_done", file_id=file_id)

            return True

        except ClientError as e:
            logger.error(
                "r2_delete_failed", file_id=file_id, error=str(e), exc_info=True
            )
            return False

    def list_expired_files(self) -> list[str]:
        """
        List files scheduled for deletion (older than 24h) per D-20, ERROR-05

        Returns:
            List of file IDs to delete
        """
        try:
            response = self.client.list_objects_v2(Bucket=self.bucket)

            if "Contents" not in response:
                return []

            expired_files = []
            now = datetime.now(UTC)

            for obj in response["Contents"]:
                # Check metadata for delete-after timestamp
                head = self.client.head_object(Bucket=self.bucket, Key=obj["Key"])

                delete_after_str = head.get("Metadata", {}).get("delete-after")
                if delete_after_str:
                    delete_after = datetime.fromisoformat(delete_after_str)
                    if now > delete_after:
                        expired_files.append(obj["Key"])

            logger.info("expired_files_found", count=len(expired_files))

            return expired_files

        except ClientError as e:
            logger.error("expired_files_list_failed", error=str(e), exc_info=True)
            return []


# Module-level instance
storage_service = StorageService()
