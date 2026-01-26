// Upload API - File upload operations

import api from '../api';

export interface UploadedFile {
    key: string;
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

export const uploadApi = {
    // Upload single file
    uploadFile: async (
        file: File,
        folder?: string,
        onProgress?: (progress: UploadProgress) => void,
    ): Promise<UploadedFile> => {
        const formData = new FormData();
        formData.append('file', file);
        if (folder) {
            formData.append('folder', folder);
        }

        const { data } = await api.post('/upload/file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percent: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                    });
                }
            },
        });

        return data;
    },

    // Upload multiple files
    uploadFiles: async (
        files: File[],
        folder?: string,
        onProgress?: (progress: UploadProgress) => void,
    ): Promise<UploadedFile[]> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        if (folder) {
            formData.append('folder', folder);
        }

        const { data } = await api.post('/upload/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    onProgress({
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percent: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                    });
                }
            },
        });

        return data;
    },

    // Delete file
    deleteFile: async (key: string): Promise<void> => {
        await api.delete(`/upload/${encodeURIComponent(key)}`);
    },

    // Get signed URL for private files
    getSignedUrl: async (key: string): Promise<string> => {
        const { data } = await api.post(`/upload/signed-url/${encodeURIComponent(key)}`);
        return data.url;
    },
};

export default uploadApi;
