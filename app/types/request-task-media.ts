export type RequestTaskMediaContent = {
  content: Uint8Array;
  fileName: string;
  mimeType: string;
};

export interface RequestTaskMediaRepository {
  findById(id: number): Promise<RequestTaskMediaContent | null>;
}
