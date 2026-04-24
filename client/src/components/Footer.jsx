import { assets } from "../assets/assets";
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest, FaMoneyBillWave } from "react-icons/fa";
import { SiRazorpay, SiStripe } from "react-icons/si";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const linkClass =
    "text-gray-300 hover:text-white transition-colors duration-300";

  return (
    <footer className="bg-[#0f172a] text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/10 pointer-events-none"></div>

      <div className="relative container mx-auto px-6 py-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white p-3 inline-block rounded-lg shadow-md">
              <img
                src={assets.logo}
                className="w-40 h-auto"
                alt="ELITEwear Logo"
              />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed text-sm mt-4">
              ELITEwear — curating excellence in every product. We're here to
              elevate your lifestyle with exceptional quality and care.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <FaFacebook className="w-5 h-5" />, label: "Facebook" },
                { icon: <FaTwitter className="w-5 h-5" />, label: "Twitter" },
                {
                  icon: <FaInstagram className="w-5 h-5" />,
                  label: "Instagram",
                },
                {
                  icon: <FaPinterest className="w-5 h-5" />,
                  label: "Pinterest",
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className={`${linkClass} bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all duration-300`}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-purple-400">
              Shop
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                "New Arrivals",
                "Best Sellers",
                "Luxury Collections",
                "Gift Cards",
                "Sale",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className={`${linkClass} flex items-center before:content-['→'] before:mr-2 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-blue-400">
              Customer Service
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { text: "Contact Us", url: "/Contact" },
                { text: "FAQs", url: "/NotFound" },
                { text: "Shipping Policy", url: "/NotFound" },
                { text: "Returns & Refunds", url: "/NotFound" },
                { text: "Size Guide", url: "/NotFound" },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.url}
                    className={`${linkClass} flex items-center before:content-['→'] before:mr-2 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-indigo-400">
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { text: "About Us", url: "/About" },
                { text: "Careers", url: "/NotFound" },
                { text: "Blog", url: "/NotFound" },
                { text: "Press", url: "/NotFound" },
                { text: "Sustainability", url: "/NotFound" },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.url}
                    className={`${linkClass} flex items-center before:content-['→'] before:mr-2 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 md:col-span-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-gradient-to-r from-purple-400 to-blue-400">
              Newsletter
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Join our mailing list for exclusive offers and early access to new
              collections.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing!");
              }}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-lg placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 rounded-lg shadow-lg hover:shadow-purple-500/20 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2">
              By subscribing you agree to our Privacy Policy
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-300">
            &copy; {currentYear} ELITEwear All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="text-xs text-gray-300 hover:text-white transition-colors duration-300 hover:underline underline-offset-4"
                >
                  {item}
                </a>
              ),
            )}
          </div>
          <div className="flex flex-col items-center md:flex-row gap-3 text-xs text-gray-300">
            <span>Secure payments with</span>
            <div className="flex items-center flex-wrap justify-center gap-3">
              <SiRazorpay
                size={20}
                className="hover:text-white transition-colors duration-300"
                title="Razorpay"
                aria-label="Razorpay"
              />
              <SiStripe
                size={20}
                className="hover:text-white transition-colors duration-300"
                title="Stripe"
                aria-label="Stripe"
              />
              <div className="flex items-center gap-1 text-green-300">
                <FaMoneyBillWave size={16} />
                <span className="text-xs">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
