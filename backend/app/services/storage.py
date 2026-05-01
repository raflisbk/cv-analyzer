import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


settings = get_settings()


class StorageError(Exception):
    pass


class StorageService:
    def __init__(self):
        self._client = None
        self.bucket = settings.CV_ANALYZER_R2_BUCKET

    @property
    def client(self):
        if self._client is None:
            self._client = boto3.client(
                "s3",
                endpoint_url=settings.CV_ANALYZER_R2_ENDPOINT,
                aws_access_key_id=settings.CV_ANALYZER_R2_ACCESS_KEY,
                aws_secret_access_key=settings.CV_ANALYZER_R2_SECRET_KEY,
                region_name="auto",
            )
        return self._client

    def upload_file(
        self, content: bytes, original_filename: str, metadata: dict[str, str]
    ) -> str:
        file_id = f"{uuid.uuid4()}-{Path(original_filename).name}"

        s3_metadata = {
            "original-filename": original_filename,
            "upload-timestamp": datetime.now(UTC).isoformat(),
            "mime-type": metadata.get("mime_type", "application/octet-stream"),
            "size": str(metadata.get("size", len(content))),
            "delete-after": (datetime.now(UTC) + timedelta(hours=24)).isoformat(),
        }

        try:
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
        try:
            response = self.client.list_objects_v2(Bucket=self.bucket)

            if "Contents" not in response:
                return []

            expired_files = []
            now = datetime.now(UTC)

            for obj in response["Contents"]:
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


storage_service = StorageService()
