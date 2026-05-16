import { apiFetch } from "./api";

type ApiResponse<T> = {
  message: string;
  data: T;
};

export type UploadedImage = {
  id: string;
  url: string;
};

function inferFileName(uri: string): string {
  const cleanUri = uri.split("?")[0];
  const lastSlash = cleanUri.lastIndexOf("/");
  const fileName = lastSlash >= 0 ? cleanUri.slice(lastSlash + 1) : cleanUri;

  if (fileName && fileName.includes(".")) {
    return fileName;
  }

  return `image-${Date.now()}.jpg`;
}

function inferMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (!ext) {
    return "image/jpeg";
  }

  if (ext === "jpg") {
    return "image/jpeg";
  }

  if (["jpeg", "png", "webp", "gif"].includes(ext)) {
    return `image/${ext}`;
  }

  return "image/jpeg";
}

async function uploadImage(uri: string): Promise<UploadedImage> {
  const fileName = inferFileName(uri);
  const mimeType = inferMimeType(fileName);
  const formData = new FormData();
  const file = { uri, name: fileName, type: mimeType };

  formData.append("image", file as unknown as Blob);

  const response = await apiFetch<ApiResponse<UploadedImage>>("/images/upload", {
    method: "POST",
    body: formData,
  });

  return response.data;
}

export const imageService = {
  uploadImage,
};
