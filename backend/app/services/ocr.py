from app.core.logging import structured_logger as logger


try:
    import easyocr
    from pdf2image import convert_from_bytes

    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    logger.warning(
        "ocr_unavailable",
        easyocr_available=False,
    )


class OCRService:

    def __init__(self):
        if not EASYOCR_AVAILABLE:
            msg = "EasyOCR not installed. Install with: pip install easyocr pdf2image"
            raise RuntimeError(msg)

        self.reader = easyocr.Reader(["en"], gpu=False)

    def extract_from_pdf_images(self, pdf_content: bytes) -> tuple[str, float]:
        if not EASYOCR_AVAILABLE:
            logger.error("ocr_not_available")
            return "", 0.0

        try:

            images = convert_from_bytes(pdf_content, dpi=300)

            logger.info("ocr_converting_pages", num_pages=len(images))

            extracted_text = []
            total_confidence = 0.0
            num_detections = 0

            for i, image in enumerate(images):
                results = self.reader.readtext(image)

                for _bbox, text, confidence in results:
                    extracted_text.append(text)
                    total_confidence += confidence
                    num_detections += 1

                logger.debug(
                    "ocr_page_done",
                    page=i + 1,
                    detections=len(results),
                )

            full_text = " ".join(extracted_text)
            avg_confidence = (
                total_confidence / num_detections if num_detections > 0 else 0.0
            )

            logger.info(
                "ocr_complete",
                text_length=len(full_text),
                confidence=avg_confidence,
                pages=len(images),
            )

            return full_text, avg_confidence

        except Exception as e:
            logger.error("ocr_failed", error=str(e), exc_info=True)
            return "", 0.0


def perform_ocr(pdf_content: bytes) -> tuple[str, float]:
    if not EASYOCR_AVAILABLE:
        logger.warning("ocr_not_installed")
        return "", 0.0

    ocr_service = OCRService()
    return ocr_service.extract_from_pdf_images(pdf_content)
