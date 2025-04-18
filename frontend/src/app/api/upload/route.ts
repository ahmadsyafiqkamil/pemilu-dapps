import { NextResponse, type NextRequest } from "next/server";
import { uploadToPinata } from "@/libs/pinata";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Upload to Pinata
    const result = await uploadToPinata(file, { name: file.name });
    console.log('Pinata upload result:', result); // Log the Pinata response

    return NextResponse.json({ 
      success: true,
      cid: result.IpfsHash,
      url: `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${result.IpfsHash}`
    }, { status: 200 });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal Server Error" },
      { status: 500 }
    );
  }
} 