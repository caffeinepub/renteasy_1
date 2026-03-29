import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import type { ExternalBlob } from "../backend";
import { ImageUploader } from "../components/ImageUploader";
import { useCreateRental } from "../hooks/useCreateRental";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AddRentalPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { mutate: createRental, isPending, isSuccess } = useCreateRental();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    location: "",
    phone: "",
  });
  const [image, setImage] = useState<ExternalBlob | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const isAuthenticated = !!identity;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }
    if (!image) newErrors.image = "Product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, price: value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, phone: value });
  };

  const handleUseCurrentLocation = () => {
    setLocationError("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await response.json();
          setFormData((prev) => ({ ...prev, location: data.display_name }));
          setLatitude(lat);
          setLongitude(lon);
        } catch {
          setLocationError("Could not get address. Please enter manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError("Please enable location or enter manually");
        setLocationLoading(false);
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please log in to add a rental");
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
        latitude,
        longitude,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            navigate({ to: "/" });
          }, 1500);
        },
      },
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to add a rental listing
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
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
          <h2 className="text-2xl font-bold mb-2">
            Rental Added Successfully!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your rental is now live on the marketplace
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to Find Items...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Add Rental</h1>
          <p className="text-muted-foreground">
            List your item for rent on the marketplace
          </p>
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
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm ${
                errors.title ? "border-destructive" : ""
              }`}
              placeholder="e.g., Mountain Bike"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-2"
            >
              Category <span className="text-destructive">*</span>
            </label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm ${
                errors.category ? "border-destructive" : ""
              }`}
              placeholder="e.g., Sports Equipment"
            />
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className={`w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none shadow-sm ${
                errors.description ? "border-destructive" : ""
              }`}
              placeholder="Describe your item in detail..."
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              Price per month (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
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
            <label
              htmlFor="location"
              className="block text-sm font-medium mb-2"
            >
              Location <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className={`flex-1 px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm ${
                  errors.location ? "border-destructive" : ""
                }`}
                placeholder="e.g., Mumbai, Maharashtra"
                data-ocid="add_rental.input"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
                data-ocid="add_rental.button"
              >
                {locationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                Use My Current Location
              </button>
            </div>
            {locationError && (
              <p className="text-sm text-amber-600 mt-1">{locationError}</p>
            )}
            {errors.location && (
              <p className="text-sm text-destructive mt-1">{errors.location}</p>
            )}
            {latitude !== null && longitude !== null && (
              <p className="text-xs text-green-600 mt-1">
                📍 Location detected: {latitude.toFixed(4)},{" "}
                {longitude.toFixed(4)}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring shadow-sm ${
                errors.phone ? "border-destructive" : ""
              }`}
              placeholder="e.g., 9876543210"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter phone number without +91 and without spaces
            </p>
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor="image-upload"
              className="block text-sm font-medium mb-2"
            >
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
              data-ocid="add_rental.submit_button"
            >
              {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              {isPending ? "Adding Rental..." : "Add Rental"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
