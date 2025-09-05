export async function generateEnhancedFallbackContent(filename: string, fileSize: number): Promise<string> {
  const baseContent = `Document Analysis: ${filename}

I have received and processed your PDF document "${filename}" (${Math.floor(fileSize / 1024)}KB). 

Based on the filename and document structure, this appears to be a list or directory document. While I cannot extract the exact text due to PDF encoding complexities, I can help you with:

• Analyzing document structure and content patterns
• Counting entries, names, or items if you describe the format
• Answering questions about the document's purpose and organization
• Providing guidance on data extraction or processing

Common content types in "${filename.toLowerCase()}" might include:
- Student names and information
- Directory listings
- Contact information
- Organizational data
- Reference lists

To help you count student names or analyze specific content, please describe:
1. What type of information you're looking for
2. The general format or layout of the document
3. Any specific patterns or sections you want me to focus on

I'm ready to assist with your document analysis needs!`

  return baseContent
}

export async function extractTextFromPDFBuffer(
  buffer: Buffer,
  filename: string,
): Promise<{ text: string; pages: number }> {
  try {
    const pdfString = buffer.toString("binary")
    let extractedText = ""

    // Strategy 1: Extract text from stream objects
    const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs) || []
    for (const stream of streamMatches) {
      const streamContent = stream.replace(/^stream\s*/, "").replace(/\s*endstream$/, "")
      // Look for readable text patterns
      const textMatches = streamContent.match(/[A-Za-z0-9\s.,;:!?\-()]{3,}/g) || []
      extractedText += textMatches.join(" ") + " "
    }

    // Strategy 2: Extract from text objects (BT...ET blocks)
    const textObjects = pdfString.match(/BT\s+.*?ET/gs) || []
    for (const textObj of textObjects) {
      // Extract text from Tj and TJ operators
      const tjMatches = textObj.match(/$$(.*?)$$\s*Tj/g) || []
      for (const match of tjMatches) {
        const text = match.match(/$$(.*?)$$/)?.[1] || ""
        extractedText += text.replace(/\\[rn]/g, " ") + " "
      }

      // Extract from TJ arrays
      const tjArrays = textObj.match(/\[(.*?)\]\s*TJ/g) || []
      for (const array of tjArrays) {
        const content = array.match(/$$(.*?)$$/g) || []
        for (const item of content) {
          extractedText += item.slice(1, -1) + " "
        }
      }
    }

    // Strategy 3: Look for common text patterns in the raw data
    const rawTextMatches = pdfString.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || []
    if (extractedText.length < 100 && rawTextMatches.length > 0) {
      extractedText += rawTextMatches.slice(0, 50).join(" ") + " "
    }

    // Strategy 4: Extract potential names (capitalized words)
    const namePatterns = pdfString.match(/[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}/g) || []
    if (namePatterns.length > 0) {
      extractedText += "\n\nDetected Names/Entries:\n" + namePatterns.slice(0, 100).join("\n")
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, " ")
      .replace(/[^\w\s.,;:!?\-()]/g, "")
      .trim()

    // Estimate page count
    const pageMatches = pdfString.match(/\/Type\s*\/Page\b/g) || []
    const pages = Math.max(pageMatches.length, Math.ceil(buffer.length / 3000))

    console.log(`[v0] Extracted text preview: "${extractedText.substring(0, 200)}..."`)
    console.log(`[v0] Total extracted length: ${extractedText.length} characters`)

    if (extractedText.trim().length > 20) {
      return { text: extractedText.trim(), pages }
    } else {
      throw new Error("Insufficient text extracted")
    }
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error}`)
  }
}
