import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Category, CreateCategoryDto } from '../../models/Category';
import { categoriesApiService } from '../../services/api/categories.service';

interface CategoryFormProps {
  isEdit?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateCategoryDto>({
    categoryName: '',
    categoryDescription: '',
    categorySlug: '',
    categoryImageUrl: '',
    displayOrder: 0,
    isActive: true,
  });
  
  useEffect(() => {
    const fetchCategory = async () => {
      if (isEdit && id) {
        try {
          setLoading(true);
          const category = await categoriesApiService.getById(id);
          setFormData({
            categoryName: category.categoryName,
            categoryDescription: category.categoryDescription || '',
            categorySlug: category.categorySlug || '',
            categoryImageUrl: category.categoryImageUrl || '',
            displayOrder: category.displayOrder,
            isActive: category.isActive,
          });
          
          if (category.categoryImageUrl) {
            setImagePreview(category.categoryImageUrl);
          }
          
          setError(null);
        } catch (err: any) {
          setError(err.message || 'Có lỗi xảy ra khi tải thông tin danh mục');
          console.error('Lỗi khi tải danh mục:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategory();
  }, [isEdit, id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        categoryImage: file,
        categoryImageUrl: '',
      });
      
      // Tạo preview cho ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerateSlug = () => {
    if (formData.categoryName) {
      const slug = formData.categoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      
      setFormData({
        ...formData,
        categorySlug: slug,
      });
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEdit && id) {
        await categoriesApiService.update(id, { ...formData, id });
      } else {
        await categoriesApiService.create(formData);
      }
      
      navigate('/categories');
    } catch (err: any) {
      setError(err.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'tạo'} danh mục`);
      console.error(`Lỗi khi ${isEdit ? 'cập nhật' : 'tạo'} danh mục:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Lỗi! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6" encType="multipart/form-data">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryName">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="categoryName"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleInputChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
              placeholder="Nhập tên danh mục"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categorySlug">
              Slug
            </label>
            <div className="flex">
              <input
                type="text"
                id="categorySlug"
                name="categorySlug"
                value={formData.categorySlug}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                placeholder="Nhập slug danh mục"
              />
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-r"
              >
                Tạo slug
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1">Slug sẽ được sử dụng trong URL</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryDescription">
              Mô tả
            </label>
            <textarea
              id="categoryDescription"
              name="categoryDescription"
              value={formData.categoryDescription}
              onChange={handleInputChange}
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
              placeholder="Nhập mô tả danh mục"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryImage">
              Hình ảnh
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  id="categoryImage"
                  name="categoryImage"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                />
                <p className="text-gray-500 text-xs mt-1">Hỗ trợ các định dạng: JPG, PNG, GIF (tối đa 2MB)</p>
              </div>
              {imagePreview && (
                <div className="w-24 h-24 border rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayOrder">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              id="displayOrder"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              min={0}
              max={1000}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
            />
            <p className="text-gray-500 text-xs mt-1">Số thấp hơn sẽ hiển thị trước</p>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700">Hiển thị danh mục (kích hoạt)</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <span>{isEdit ? 'Cập nhật' : 'Tạo mới'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm; 