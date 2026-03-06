import { ROUTES } from "@/router/routes.const";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to={ROUTES.HOME} className="text-xl font-bold">
              <span className="text-teal-500">Tech</span>
              <span className="text-zinc-700">Gear</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Phụ kiện công nghệ chính hãng, giá tốt nhất Việt Nam.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-900">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to={ROUTES.PRODUCTS} className="hover:text-teal-500">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to={ROUTES.HOME} className="hover:text-teal-500">
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link to={ROUTES.HOME} className="hover:text-teal-500">
                  Tin tức
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-900">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-teal-500">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-500">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-500">
                  Chính sách bảo hành
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-900">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>📞 Hotline: 1900-xxxx</li>
              <li>📧 Email: support@techgear.vn</li>
              <li>📍 TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} TechGear. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
