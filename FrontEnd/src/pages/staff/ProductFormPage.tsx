import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { API_ENDPOINTS } from "@/constants/api.config";
import type { BackendProduct } from "@/interfaces/product.types";
import { apiClient } from "@/lib/api";
import { ROUTES } from "@/router/routes.const";
import { categoryService } from "@/services/categoryService";
import {
  productService,
  type ProductSaveFiles,
  type ProductSavePayload,
} from "@/services/productService";
import { createProductSchema, type CreateProductFormData } from "@/validations/product.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Package, Upload, Wrench, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const IMAGE_SLOTS = ["img", "img2", "img3", "img4", "img5"] as const;

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAdminContext = location.pathname.startsWith("/admin");
  const isServiceMode = searchParams.get("service") === "true";
  const productsRoute = isAdminContext ? ROUTES.ADMIN_PRODUCTS : ROUTES.STAFF_PRODUCTS;
  const queryClient = useQueryClient();

  const [isService, setIsService] = useState(isServiceMode);
  const [selectedVersionId, setSelectedVersionId] = useState<number>(0);
  const imageRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null]);
  const [imageFiles, setImageFiles] = useState<Array<File | null>>([null, null, null, null, null]);
  const [existingImageUrls, setExistingImageUrls] = useState<Array<string | null>>([
    null,
    null,
    null,
    null,
    null,
  ]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: productService.getBrands,
  });

  const { data: productVersions } = useQuery({
    queryKey: ["product-versions"],
    queryFn: productService.getProductVersions,
  });

  const { data: existingProduct } = useQuery({
    queryKey: ["products", "backend-detail", id],
    queryFn: async () => {
      const res = await apiClient.get<BackendProduct>(API_ENDPOINTS.PRODUCTS.DETAIL(id!));
      return res.data;
    },
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: 0,
      brandId: 0,
      price: 0,
      stockQuantity: 0,
      active: true,
      type: true,
    },
  });

  const activeValue = useWatch({ control, name: "active" });

  useEffect(() => {
    if (existingProduct) {
      setValue("name", existingProduct.name);
      setValue("description", existingProduct.description);
      const cat = categories?.find((c) => c.name === existingProduct.categoryName);
      setValue("categoryId", cat?.id ?? 0);
      const brand = brands?.find((b) => b.name === existingProduct.brandName);
      setValue("brandId", brand?.id ?? 0);
      const version = productVersions?.find((v) => v.versionName === existingProduct.versionName);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVersionId(version?.id ?? 0);
      setValue("active", existingProduct.active);
      setValue("price", existingProduct.price ?? 0);
      setValue("stockQuantity", existingProduct.quantity ?? 0);
      const isServ = existingProduct.type === false;
      setIsService(isServ);
      setValue("type", !isServ);
      const urls = existingProduct.imgUrls ?? [];
      setExistingImageUrls([
        urls[0] ?? null,
        urls[1] ?? null,
        urls[2] ?? null,
        urls[3] ?? null,
        urls[4] ?? null,
      ]);
    }
  }, [existingProduct, categories, brands, productVersions, setValue]);

  const setImageFile = useCallback((index: number, file: File | null) => {
    setImageFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  }, []);

  const saveMutation = useMutation({
    mutationFn: (data: CreateProductFormData) => {
      const payload: ProductSavePayload = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId,
        price: data.price,
        stockQuantity: isService ? 0 : (data.stockQuantity ?? 0),
        active: data.active ?? true,
        versionId: selectedVersionId || undefined,
        type: !isService,
      };
      if (isEdit && id) payload.id = Number(id);

      const files: ProductSaveFiles = {
        img: imageFiles[0],
        img2: imageFiles[1],
        img3: imageFiles[2],
        img4: imageFiles[3],
        img5: imageFiles[4],
      };
      return isEdit
        ? productService.updateProduct(payload, files)
        : productService.createProduct(payload, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "products-raw"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products-raw"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      const itemLabel = isService ? "dịch vụ" : "sản phẩm";
      toast.success(isEdit ? `Cập nhật ${itemLabel} thành công!` : `Tạo ${itemLabel} thành công!`);
      navigate(productsRoute);
    },
    onError: () => toast.error("Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const onSubmit = (data: CreateProductFormData) => {
    saveMutation.mutate(data);
  };

  const pageTitle = isEdit
    ? isService
      ? "Chỉnh sửa dịch vụ"
      : "Chỉnh sửa sản phẩm"
    : isService
      ? "Thêm dịch vụ mới"
      : "Thêm sản phẩm mới";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={productsRoute}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-zinc-900">{pageTitle}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type indicator — read-only, set at creation time via URL param */}
            <div
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                isService ? "border-orange-300 bg-orange-50" : "border-blue-200 bg-blue-50"
              }`}>
              {isService ? (
                <Wrench className="h-5 w-5 flex-shrink-0 text-orange-500" />
              ) : (
                <Package className="h-5 w-5 flex-shrink-0 text-blue-500" />
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${isService ? "text-orange-700" : "text-blue-700"}`}>
                  {isService ? "Dịch vụ" : "Sản phẩm"}
                </p>
                <p className={`text-xs ${isService ? "text-orange-500" : "text-blue-500"}`}>
                  {isService
                    ? "Dịch vụ không có quản lý tồn kho"
                    : "Sản phẩm vật lý — có theo dõi tồn kho"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tên {isService ? "dịch vụ" : "sản phẩm"} *</Label>
                <Input
                  id="name"
                  placeholder={`Nhập tên ${isService ? "dịch vụ" : "sản phẩm"}`}
                  {...register("name")}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price.message as string}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết *</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Mô tả chi tiết..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh mục *</Label>
                <select
                  id="categoryId"
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                  {...register("categoryId", { valueAsNumber: true })}>
                  <option value={0}>Chọn danh mục</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500">{errors.categoryId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandId">Thương hiệu *</Label>
                <select
                  id="brandId"
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                  {...register("brandId", { valueAsNumber: true })}>
                  <option value={0}>Chọn thương hiệu</option>
                  {brands?.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brandId && <p className="text-xs text-red-500">{errors.brandId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="versionId">Phiên bản</Label>
                <select
                  id="versionId"
                  className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(Number(e.target.value))}>
                  <option value={0}>Chọn phiên bản</option>
                  {productVersions?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.versionName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock — hidden for services */}
            {!isService && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Số lượng tồn kho</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="0"
                    {...register("stockQuantity", { valueAsNumber: true })}
                  />
                  {errors.stockQuantity && (
                    <p className="text-xs text-red-500">{errors.stockQuantity.message as string}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch
                id="active"
                checked={activeValue ?? true}
                onCheckedChange={(v) => setValue("active", v)}
              />
              <Label htmlFor="active">Hiển thị {isService ? "dịch vụ" : "sản phẩm"}</Label>
            </div>
          </CardContent>
        </Card>

        {/* Images — up to 5 slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hình ảnh (tối đa 5 ảnh)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {IMAGE_SLOTS.map((_, index) => {
                const file = imageFiles[index];
                const existingUrl = existingImageUrls[index];
                const preview = file ? URL.createObjectURL(file) : existingUrl;
                const isFirst = index === 0;

                return (
                  <div key={index} className="space-y-1">
                    <input
                      ref={(el) => {
                        imageRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setImageFile(index, e.target.files?.[0] ?? null)}
                    />
                    <div
                      className={`relative flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
                        preview
                          ? "border-teal-400"
                          : isFirst
                            ? "border-gray-300 hover:border-teal-400"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => imageRefs.current[index]?.click()}>
                      {preview ? (
                        <>
                          <img src={preview} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageFile(index, null);
                              setExistingImageUrls((prev) => {
                                const n = [...prev];
                                n[index] = null;
                                return n;
                              });
                            }}>
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <Upload className="h-5 w-5 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {isFirst ? "Ảnh chính *" : `Ảnh ${index + 1}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="submit"
            className="bg-teal-500 hover:bg-teal-600"
            disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật" : isService ? "Tạo dịch vụ" : "Tạo sản phẩm"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to={productsRoute}>Hủy</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
