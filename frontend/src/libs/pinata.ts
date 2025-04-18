if (!process.env.PINATA_JWT) {
  throw new Error('Missing Pinata JWT');
}

export async function uploadToPinata(file: File, options: { name: string }) {
  const formData = new FormData();
  formData.append('file', file);
  
  const metadata = JSON.stringify({
    name: options.name
  });
  formData.append('pinataMetadata', metadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1
  });
  formData.append('pinataOptions', pinataOptions);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PINATA_JWT}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to Pinata: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
} 