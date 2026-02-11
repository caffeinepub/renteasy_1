import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateRental } from '../hooks/useCreateRental';
import { ImageUploader } from '../components/ImageUploader';
import { ExternalBlob } from '../backend';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AddRentalPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { mutate: createRental, isPending, isSuccess } = useCreateRental();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    location: '',
    phone: '',
  });
  const [image, setImage] = useState<ExternalBlob | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAuthenticated = !!identity;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!image) newErrors.image = 'Product image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, price: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please log in to add a rental');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const price = formData.price.trim() ? BigInt(formData.price) : null;

    createRental(
      {
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        price,
        location: formData.location.trim(),
        phone: formData.phone.trim(),
        image: image!,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            navigate({ to: '/' });
          }, 1500);
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to add a rental listing</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Rental Added Successfully!</h2>
          <p className="text-muted-foreground mb-6">Your rental is now live on the marketplace</p>
          <p className="text-sm text-muted-foreground">Redirecting to Find Items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Add Rental</h1>
          <p className="text-muted-foreground">List your item for rent on the marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Product Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm ${
                errors.title ? 'border-destructive' : ''
              }`}
              placeholder="e.g., Mountain Bike"
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category <span className="text-destructive">*</span>
            </label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm ${
                errors.category ? 'border-destructive' : ''
              }`}
              placeholder="e.g., Sports Equipment"
            />
            {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none shadow-sm ${
                errors.description ? 'border-destructive' : ''
              }`}
              placeholder="Describe your item in detail..."
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              Price per month (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <input
                id="price"
                type="text"
                inputMode="numeric"
                value={formData.price}
                onChange={handlePriceChange}
                className="w-full pl-8 pr-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
                placeholder="0"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              Location <span className="text-destructive">*</span>
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm ${
                errors.location ? 'border-destructive' : ''
              }`}
              placeholder="e.g., San Francisco, CA"
            />
            {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm ${
                errors.phone ? 'border-destructive' : ''
              }`}
              placeholder="e.g., (555) 123-4567"
            />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Image <span className="text-destructive">*</span>
            </label>
            <ImageUploader onImageChange={setImage} error={errors.image} />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium inline-flex items-center justify-center gap-2 shadow-md"
            >
              {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              {isPending ? 'Adding Rental...' : 'Add Rental'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
