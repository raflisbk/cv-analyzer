import { expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import os from "os";

const API_URL = process.env.E2E_API_URL || "http://localhost:8000/api/v1";

export function apiUrl(p: string) {
  return `${API_URL}${p}`;
}

export const sampleJdText = [
  "Senior Software Engineer - Full Stack",
  "",
  "We are looking for a Senior Software Engineer to join our growing team.",
  "You will design and implement scalable microservices using Python and TypeScript.",
  "Requirements: 5+ years experience with Python, FastAPI, PostgreSQL, React, Docker.",
  "Nice to have: Kubernetes, CI/CD, AWS/GCP, GraphQL, team leadership experience.",
  "We offer competitive salary, remote work, and excellent growth opportunities.",
].join("\n");

const cvText = [
  "JOHN SMITH",
  "john.smith@email.com | +1-555-0123 | San Francisco, CA",
  "",
  "PROFESSIONAL SUMMARY",
  "Senior Software Engineer with 7+ years of experience in Python, TypeScript, and cloud infrastructure. Led teams of 5-10 engineers. Built scalable APIs serving millions of requests per day.",
  "",
  "EXPERIENCE",
  "Senior Software Engineer - TechCorp Inc. (2020-Present)",
  "Led development of microservices serving 10M+ requests/day using FastAPI and PostgreSQL.",
  "Reduced API latency by 40% through Redis caching and query optimization.",
  "Mentored 5 junior developers and conducted code reviews for team of 10 engineers.",
  "Implemented CI/CD pipelines with GitHub Actions, reducing deployment time by 60%.",
  "",
  "Software Engineer - StartupXYZ (2017-2020)",
  "Built RESTful APIs with Django and Flask for e-commerce platform.",
  "Designed database schema for order management system handling 50K+ daily transactions.",
  "Integrated third-party payment systems including Stripe and PayPal.",
  "",
  "EDUCATION",
  "B.S. Computer Science - University of California, Berkeley (2017)",
  "GPA: 3.8/4.0, Dean's List",
  "",
  "SKILLS",
  "Python, TypeScript, FastAPI, React, PostgreSQL, Docker, Kubernetes, AWS, Redis, Celery, Git, CI/CD, GraphQL, REST APIs",
  "",
  "CERTIFICATIONS",
  "AWS Solutions Architect Associate (2022)",
  "Kubernetes Administrator (CKA) (2021)",
].join("\n");

let _cvPath: string | null = null;

function createDocx(): Buffer {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const paragraphs = cvText
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const isBold =
        line === line.toUpperCase() &&
        line.length > 2 &&
        /[A-Z]/.test(line) &&
        !line.includes("@") &&
        !line.includes("+") &&
        !line.includes("|");
      const runXml = isBold
        ? `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r>`
        : `<w:r><w:t xml:space="preserve">${escaped}</w:t></w:r>`;
      return `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr>${runXml}</w:p>`;
    })
    .join("");

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs}</w:body>
</w:document>`;

  const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  // Build a minimal ZIP file (DOCX = ZIP)
  return buildZip([
    { name: "[Content_Types].xml", data: Buffer.from(contentTypes, "utf-8") },
    { name: "_rels/.rels", data: Buffer.from(rels, "utf-8") },
    { name: "word/document.xml", data: Buffer.from(document, "utf-8") },
    {
      name: "word/_rels/document.xml.rels",
      data: Buffer.from(wordRels, "utf-8"),
    },
  ]);
}

// Minimal ZIP builder
function buildZip(
  files: { name: string; data: Buffer }[]
): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = Buffer.from(file.name, "utf-8");
    const crc = crc32(file.data);
    const size = file.data.length;

    // Local file header
    const local = Buffer.alloc(30 + nameBytes.length + size);
    local.writeUInt32LE(0x04034b50, 0); // signature
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // compression (stored)
    local.writeUInt16LE(0, 10); // mod time
    local.writeUInt16LE(0, 12); // mod date
    local.writeUInt32LE(crc, 14); // crc32
    local.writeUInt32LE(size, 18); // compressed size
    local.writeUInt32LE(size, 22); // uncompressed size
    local.writeUInt16LE(nameBytes.length, 26); // filename length
    local.writeUInt16LE(0, 28); // extra field length
    nameBytes.copy(local, 30);
    file.data.copy(local, 30 + nameBytes.length);
    localHeaders.push(local);

    // Central directory header
    const central = Buffer.alloc(46 + nameBytes.length);
    central.writeUInt32LE(0x02014b50, 0); // signature
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0, 8); // flags
    central.writeUInt16LE(0, 10); // compression
    central.writeUInt16LE(0, 12); // mod time
    central.writeUInt16LE(0, 14); // mod date
    central.writeUInt32LE(crc, 16); // crc32
    central.writeUInt32LE(size, 20); // compressed size
    central.writeUInt32LE(size, 24); // uncompressed size
    central.writeUInt16LE(nameBytes.length, 28); // filename length
    central.writeUInt16LE(0, 30); // extra field length
    central.writeUInt16LE(0, 32); // comment length
    central.writeUInt16LE(0, 34); // disk number
    central.writeUInt16LE(0, 36); // internal attrs
    central.writeUInt32LE(0, 38); // external attrs
    central.writeUInt32LE(offset, 42); // local header offset
    nameBytes.copy(central, 46);
    centralHeaders.push(central);

    offset += local.length;
  }

  const centralOffset = offset;
  let centralSize = 0;
  for (const c of centralHeaders) centralSize += c.length;

  // End of central directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // disk with central dir
  eocd.writeUInt16LE(files.length, 8); // entries on disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralSize, 12); // central dir size
  eocd.writeUInt32LE(centralOffset, 16); // central dir offset
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

// CRC32 implementation
function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function ensureSampleCV(): string {
  if (_cvPath && fs.existsSync(_cvPath)) return _cvPath;

  const tmpDir = os.tmpdir();
  _cvPath = path.join(tmpDir, "e2e-test-cv.docx");
  fs.writeFileSync(_cvPath, createDocx());
  return _cvPath;
}

export async function uploadCV(): Promise<string | null> {
  const cvPath = ensureSampleCV();
  const formData = new FormData();
  const bytes = fs.readFileSync(cvPath);
  formData.append(
    "file",
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    "e2e-test-cv.docx"
  );

  try {
    const resp = await fetch(apiUrl("/upload"), {
      method: "POST",
      body: formData,
    });
    if (!resp.ok) return null;
    const body = await resp.json();
    return body?.data?.job_id ?? body?.job_id ?? null;
  } catch {
    return null;
  }
}

export async function waitForJobComplete(
  jobId: string,
  maxWait = 60
): Promise<boolean> {
  for (let i = 0; i < maxWait / 2; i++) {
    try {
      const resp = await fetch(apiUrl(`/jobs/${jobId}/results`));
      const body = await resp.json();
      const d = body?.data ?? body;
      if (d?.status === "complete") return true;
      if (d?.status === "failed") return false;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}
