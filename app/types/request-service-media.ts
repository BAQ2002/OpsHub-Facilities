export type RequestMediaContent = {
  content: Uint8Array;
  fileName: string;
  mimeType: string;
};

export interface RequestServiceMediaRepository {
  findById(id: number): Promise<RequestMediaContent | null>;
}
