import { api } from '../apiConfig';

export const utilsService = {
    uploadImage: async (image) => {
        if (!image) {
            throw new Error('Image file is required');
        }
        
        const formData = new FormData();
        formData.append('image', image, image.name);
        
        const response = await api.post('/api/v1/util/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    }
};
