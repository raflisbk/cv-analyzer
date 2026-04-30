"""OCR service using EasyOCR."""

from app.core.logging import structured_logger as logger


try:
    import easyocr
    from pdf2image import convert_from_bytes

    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    logger.warning(
        "EasyOCR or pdf2image not available - OCR fallback disabled",
        extra={"easyocr_available": False},
    )


class OCRService:
    """
    OCR service with EasyOCR for scanned document text extraction
    """

    def __init__(self):
        if not EASYOCR_AVAILABLE:
            msg = "EasyOCR not installed. Install with: pip install easyocr pdf2image"
            raise RuntimeError(msg)
        # Initialize with English and common CV languages
        self.reader = easyocr.Reader(["en"], gpu=False)  # CPU mode for compatibility

    def extract_from_pdf_images(self, pdf_content: bytes) -> tuple[str, float]:
        """
        Perform OCR on PDF by converting to images

        Args:
            pdf_content: PDF file bytes

        Returns:
            tuple of (extracted_text, confidence_score)
        """
        if not EASYOCR_AVAILABLE:
            logger.error("OCR requested but EasyOCR not available")
            return "", 0.0

        try:
            # Convert PDF to images
            images = convert_from_bytes(pdf_content, dpi=300)

            logger.info(
                "Converting PDF to images for OCR", extra={"num_pages": len(images)}
            )

            extracted_text = []
            total_confidence = 0.0
            num_detections = 0

            # OCR each page
            for i, image in enumerate(images):
                results = self.reader.readtext(image)

                for _bbox, text, confidence in results:
                    extracted_text.append(text)
                    total_confidence += confidence
                    num_detections += 1

                logger.debug(
                    "OCR page processed",
                    extra={"page": i + 1, "detections": len(results)},
                )

            full_text = " ".join(extracted_text)
            avg_confidence = (
                total_confidence / num_detections if num_detections > 0 else 0.0
            )

            logger.info(
                "OCR extraction complete",
                extra={
                    "text_length": len(full_text),
                    "confidence": avg_confidence,
                    "pages": len(images),
                },
            )

            return full_text, avg_confidence

        except Exception as e:
            logger.error("OCR extraction failed", extra={"error": str(e)})
            return "", 0.0


def perform_ocr(pdf_content: bytes) -> tuple[str, float]:
    """
    Module-level OCR function for easy import

    Args:
        pdf_content: PDF file bytes

    Returns:
        tuple of (extracted_text, confidence_score)
    """
    if not EASYOCR_AVAILABLE:
        logger.warning("OCR requested but EasyOCR not installed")
        return "", 0.0

    ocr_service = OCRService()
    return ocr_service.extract_from_pdf_images(pdf_content)
