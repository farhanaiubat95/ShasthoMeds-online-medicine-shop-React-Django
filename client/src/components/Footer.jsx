// src/components/Footer.jsx
import { Facebook, Instagram, Twitter, LinkedIn, LocationOn, Phone, Email } from '@mui/icons-material';

export default function Footer() {
  return (
    <footer className="bg-[#0F918F] text-white px-4 sm:px-6 lg:px-12 py-10 mt-10 ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        
        {/* Logo & Social */}
        <div>
          <h1 className="text-lg font-semibold mb-3">Shasthomeds</h1>
          <div className="flex space-x-4 mt-2">
            <Facebook className="hover:text-gray-300 cursor-pointer" />
            <Instagram className="hover:text-gray-300 cursor-pointer" />
            <Twitter className="hover:text-gray-300 cursor-pointer" />
            <LinkedIn className="hover:text-gray-300 cursor-pointer" />
          </div>
        </div>

        {/* Information */}
        <div>
          <h2 className="font-semibold mb-3">INFORMATION</h2>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline text-orange-200">Home</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">About us</a></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h2 className="font-semibold mb-3">CATEGORIES</h2>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Accessories</a></li>
            <li><a href="#" className="hover:underline">Brands</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-semibold mb-3">CONTACT</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <LocationOn className="mr-2 mt-0.5 shrink-0" />
              <span>Saudi Colony, Dhaka Cantt. ,Dhaka, Bangladesh</span>
            </li>
            <li className="flex items-center">
              <Phone className="mr-2 shrink-0" />
              <span>+088 123 456 789</span>
            </li>
            <li className="flex items-center">
              <Email className="mr-2 shrink-0" />
              <span>shasthomeds@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-teal-600 mt-10 pt-4 text-center text-xs text-gray-200">
        © 2025 Shasthomeds. All Rights Reserved.
      </div>
    </footer>
  );
}
